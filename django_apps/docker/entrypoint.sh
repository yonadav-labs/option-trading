#!/usr/bin/env bash

_log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S %z')]" "$@"
}

DOCKER_COMMAND=( "$@" )

# The environment var 'APP_HOME' is provided by the Dockerfile.
export DJANGO_ROOT_DIR="${APP_HOME:-'/home/app/backend'}"
export PYTHONPATH="${PYTHONPATH:-"$DJANGO_ROOT_DIR"}"
export DJANGO_COLLECT_STATIC="${DJANGO_COLLECT_STATIC:-1}"
export DATABASE_CONNECTION_WAIT="${DATABASE_CONNECTION_WAIT:-0.5}"
export DATABASE_CONNECTION_RETRIES="${DATABASE_CONNECTION_RETRIES:-60}"
export GUNICORN_TIMEOUT="${GUNICORN_TIMEOUT:-120}"
export GUNICORN_WORKERS="${GUNICORN_WORKERS:-3}"

# Update the docker command if needed.
if [[ "${DOCKER_COMMAND[0]}" == "gunicorn" ]] ; then
  DOCKER_COMMAND=( "${DOCKER_COMMAND[@]}" "--timeout" "$GUNICORN_TIMEOUT" "--workers" "$GUNICORN_WORKERS" )
fi

cd "$DJANGO_ROOT_DIR" || { _log "Django root directory not found!" ; exit 1 ; }

if [[ "$DATABASE" == "postgres" ]] ; then
  _log "Waiting for a PostgreSQL connection at $SQL_HOST:$SQL_PORT..."

  RETRIES=0
  while [[ $RETRIES -lt $DATABASE_CONNECTION_RETRIES ]] && ! nc -z "$SQL_HOST" "$SQL_PORT" ; do
    sleep "$DATABASE_CONNECTION_WAIT"
    _log "Waiting for a PostgreSQL connection at $SQL_HOST:$SQL_PORT..."
    RETRIES=$(( $RETRIES + 1 ))
  done

  if ! nc -z "$SQL_HOST" "$SQL_PORT" ; then
    _log "Unable to connect to PostgreSQL at $SQL_HOST:$SQL_PORT... exiting"
    exit 1
  fi

  _log "PostgreSQL connection established at $SQL_HOST:$SQL_PORT"
fi

python manage.py migrate_locked || { _log "Unable to migrate the database" ; exit 1 ; }

if [[ $DJANGO_COLLECT_STATIC -ne 0 ]] ; then
  _log "Running collectstatic..."
  python manage.py collectstatic --no-input --clear
else
  _log "Skipping collectstatic"
fi

# Run the Django server command.
_log "Entrypoint command:" "${DOCKER_COMMAND[@]}"
eval "${DOCKER_COMMAND[@]}"
