import time

from django.conf import settings
from django.core.management.base import (CommandError, no_translations)
from django.core.management.commands.migrate import Command as MigrateCommand
from django.db import connections
from psycopg2.extensions import ISOLATION_LEVEL_REPEATABLE_READ
from psycopg2.extras import RealDictCursor


class Command(MigrateCommand):
    help = 'Updates database schema with a distributed lock to prevent simultaneous migration runs. ' + \
           'Manages both apps with migrations and those without.'

    requires_system_checks = False

    _DB_MIGRATION_LOCK_TABLE_NAME = 'django_migration_lock'
    _DB_MIGRATION_LOCK_OWNER_PARAM = 'lock_owner'

    _DB_MIGRATION_LOCK_TABLE_CREATE_IF_NOT_EXISTS_SQL = f"""
        CREATE TABLE IF NOT EXISTS public.{_DB_MIGRATION_LOCK_TABLE_NAME}
        (
            id integer NOT NULL,
            locked boolean NOT NULL,
            lock_owner character varying(254),
            lock_granted_at timestamp with time zone,
            PRIMARY KEY (id)
        )
    """

    _DB_MIGRATION_LOCK_ACQUISITION_SQL = f"""
        INSERT INTO
            {_DB_MIGRATION_LOCK_TABLE_NAME} (id, locked, lock_granted_at, lock_owner)
            VALUES (1, TRUE, CURRENT_TIMESTAMP(3), %({_DB_MIGRATION_LOCK_OWNER_PARAM})s)
        ON CONFLICT (id) DO
            UPDATE SET
                locked = TRUE,
                lock_granted_at = CURRENT_TIMESTAMP(3),
                lock_owner = %({_DB_MIGRATION_LOCK_OWNER_PARAM})s
            WHERE
                {_DB_MIGRATION_LOCK_TABLE_NAME}.id = 1 AND NOT {_DB_MIGRATION_LOCK_TABLE_NAME}.locked
    """

    _DB_MIGRATION_LOCK_RELEASE_SQL = f"""
        UPDATE
            {_DB_MIGRATION_LOCK_TABLE_NAME}
        SET
            locked = FALSE,
            lock_granted_at = NULL,
            lock_owner = NULL
        WHERE
            id = 1
    """

    _DB_MIGRATION_LOCK_FETCH_SQL = f"""
        SELECT
            id,
            locked,
            lock_granted_at,
            lock_owner
        FROM
            {_DB_MIGRATION_LOCK_TABLE_NAME}
        WHERE
            id = 1
    """

    _DB_MIGRATION_LOCK_RELEASE_IF_OWNER_SQL = \
        _DB_MIGRATION_LOCK_RELEASE_SQL + f' AND lock_owner = %({_DB_MIGRATION_LOCK_OWNER_PARAM})s'

    def __init__(self, stdout=None, stderr=None, no_color=False, force_color=False):
        super().__init__(stdout=stdout, stderr=stderr, no_color=no_color, force_color=force_color)
        self._lock_owner = settings.SERVER_HOSTNAME
        self.lock_acquisition_params = {Command._DB_MIGRATION_LOCK_OWNER_PARAM: self._lock_owner}

    def add_arguments(self, parser):
        lock_manipulation_argument_group = parser.add_mutually_exclusive_group()
        lock_manipulation_argument_group.add_argument(
            '--release',
            action='store_true',
            dest='release_lock',
            help='Force the release of the database migration lock.',
        )
        lock_manipulation_argument_group.add_argument(
            '--fetch',
            action='store_true',
            dest='fetch_lock',
            help='Fetch the current database migration lock, if any',
        )

        super().add_arguments(parser)
        parser.add_argument(
            '--retries',
            action='store',
            dest='retries',
            type=int,
            default=30,
            help='How many times to try to acquire the database migration lock before exiting.',
        )
        parser.add_argument(
            '--pause',
            action='store',
            dest='pause_seconds',
            type=int,
            default=10,
            help='How many seconds to pause between database migration lock acquisition attempts.',
        )

    @no_translations
    def handle(self, *args, **options):
        database = options['database']
        max_retries = options['retries']
        pause_seconds = options['pause_seconds']
        release_lock = options['release_lock']
        fetch_lock = options['fetch_lock']

        connection_wrapper = connections[database]
        Command._ensure_migration_lock_table(connection_wrapper)

        if fetch_lock:
            self._fetch_migration_lock(connection_wrapper)
        elif release_lock:
            self._release_migration_lock(max_retries, pause_seconds, connection_wrapper)
        else:
            self._acquire_migration_lock(max_retries, pause_seconds, connection_wrapper)
            try:
                super().handle(*args, **options)
            finally:
                self._release_migration_lock_if_owned(max_retries, pause_seconds, connection_wrapper)

    def _fetch_migration_lock(self, connection_wrapper):
        lock_data = None

        with Command._create_connection(connection_wrapper) as connection:
            with Command._create_cursor(connection) as cursor:
                cursor.execute(Command._DB_MIGRATION_LOCK_FETCH_SQL)
                rows_fetched = cursor.rowcount
                if rows_fetched >= 1:
                    lock_data = cursor.fetchone().copy()

        lock_exists = lock_data is not None and lock_data['locked']

        if lock_exists:
            self.stdout.write(
                f"Database lock exists for owner '{lock_data['lock_owner']}', " +
                f"granted at {lock_data['lock_granted_at']}.",
                self.style.MIGRATE_LABEL
            )
        else:
            self.stdout.write(
                'No database migration lock exists.',
                self.style.MIGRATE_LABEL
            )

        return lock_exists

    def _acquire_migration_lock(self, max_retries, pause_seconds, connection_wrapper):
        db_migration_lock_acquired = False
        retries = 0

        while not db_migration_lock_acquired and retries < max_retries:
            retries += 1
            with Command._create_connection(connection_wrapper) as connection:
                with Command._create_cursor(connection) as cursor:
                    cursor.execute(Command._DB_MIGRATION_LOCK_ACQUISITION_SQL, self.lock_acquisition_params)
                    updated_rows = cursor.rowcount
                    if updated_rows <= 0:
                        self._fetch_migration_lock(connection_wrapper)

            if updated_rows >= 1:
                db_migration_lock_acquired = True
                self.stdout.write(
                    'Successfully acquired the database migration lock.',
                    self.style.MIGRATE_LABEL
                )
            else:
                self.stdout.write(
                    f"Attempting another lock acquisition in {pause_seconds} seconds...",
                    self.style.MIGRATE_LABEL
                )
                time.sleep(pause_seconds)

        if not db_migration_lock_acquired:
            raise CommandError('Failed to acquire database migration lock.', returncode=1)

    def _release_migration_lock(self, max_retries, pause_seconds, connection_wrapper):
        if self._fetch_migration_lock(connection_wrapper):
            self._unlock_migration(
                max_retries,
                pause_seconds,
                connection_wrapper,
                Command._DB_MIGRATION_LOCK_RELEASE_SQL,
                {}
            )

    def _release_migration_lock_if_owned(self, max_retries, pause_seconds, connection_wrapper):
        return self._unlock_migration(
            max_retries,
            pause_seconds,
            connection_wrapper,
            Command._DB_MIGRATION_LOCK_RELEASE_IF_OWNER_SQL,
            self.lock_acquisition_params
        )

    def _unlock_migration(self, max_retries, pause_seconds, connection_wrapper, release_sql, sql_params):
        db_migration_lock_released = False
        retries = 0

        while not db_migration_lock_released and retries < max_retries:
            retries += 1
            with Command._create_connection(connection_wrapper) as connection:
                with Command._create_cursor(connection) as cursor:
                    cursor.execute(release_sql, sql_params)
                    updated_rows = cursor.rowcount

            if updated_rows >= 1:
                db_migration_lock_released = True
                self.stdout.write(
                    'Successfully released the database migration lock.',
                    self.style.MIGRATE_LABEL
                )
            else:
                self.stdout.write(
                    'Failed to release database migration lock. ' +
                    f'Attempting another lock release in {pause_seconds} seconds...',
                    self.style.MIGRATE_LABEL
                )
                time.sleep(pause_seconds)

        if not db_migration_lock_released:
            raise CommandError('Failed to release database migration lock.', returncode=1)

    @staticmethod
    def _ensure_migration_lock_table(connection_wrapper):
        with Command._create_connection(connection_wrapper) as connection:
            with Command._create_cursor(connection) as cursor:
                cursor.execute(Command._DB_MIGRATION_LOCK_TABLE_CREATE_IF_NOT_EXISTS_SQL)

    @staticmethod
    def _create_connection(connection_wrapper):
        connection = connection_wrapper.get_new_connection(connection_wrapper.get_connection_params())
        connection.set_session(
            isolation_level=ISOLATION_LEVEL_REPEATABLE_READ,
            readonly=False,
            deferrable=False,
            autocommit=False
        )
        return connection

    @staticmethod
    def _create_cursor(connection):
        return connection.cursor(cursor_factory=RealDictCursor)
