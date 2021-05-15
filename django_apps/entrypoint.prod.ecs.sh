#!/usr/bin/env sh

log_prefix () {
  echo -n "[$(date +'%Y-%m-%d %H:%M:%S %z')]"
}

cd /home/app/backend

if [ "$DATABASE" = "postgres" ] ; then
  echo "$(log_prefix) Waiting for a PostgreSQL connection at $SQL_HOST:$SQL_PORT..."

  RETRIES=0
  while [ $RETRIES -lt $DATABASE_CONNECTION_RETRIES ] && ! nc -z "$SQL_HOST" "$SQL_PORT" ; do
    sleep "$DATABASE_CONNECTION_WAIT"
    echo "$(log_prefix) Waiting for a PostgreSQL connection at $SQL_HOST:$SQL_PORT..."
    RETRIES=$(( $RETRIES + 1 ))
  done

  if ! nc -z "$SQL_HOST" "$SQL_PORT" ; then
    echo "$(log_prefix) Unable to connect to PostgreSQL at $SQL_HOST:$SQL_PORT... exiting"
    exit 1
  fi

  echo "$(log_prefix) PostgreSQL connection established at $SQL_HOST:$SQL_PORT"
fi

python manage.py migrate_locked
python manage.py collectstatic --no-input --clear

gunicorn django_apps.wsgi:application --bind 0.0.0.0:8080
