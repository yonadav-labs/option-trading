# Tigerstance.com

## Local

### Set up

* Install docker.
* Start containers: `docker-compose up -d`, `docker-compose up --build -d`
* Stop containers: `docker-compose down`,  `docker-compose down -v`

### Common commands

* `docker-compose exec backend python manage.py makemigrations`
* `docker-compose exec backend python manage.py migrate_locked`
* `docker-compose exec backend python tiger/scripts/fetch_tickers.py`
* `docker-compose exec backend python manage.py iexcloud_fetch_market_dates`
* `docker-compose exec backend python manage.py iexcloud_fetch_ticker_info`

## Deployment

#### Local

* Pycharm pythonpath: https://stackoverflow.com/questions/28326362/pycharm-and-pythonpath
* https://medium.com/@fullsour/how-to-switch-user-on-the-aws-cli-77c2b314e12d
* `aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 813539762970.dkr.ecr.us-east-2.amazonaws.com`
* `docker-compose run backend python manage.py test`

#### Remote

See [the tsops `deploy-service` command](https://github.com/botigerstance/devops/tree/main/tsops-cli#the-deploy-service-subcommand).
