# options
* `docker-compose up -d`
* `docker-compose down`
* `docker-compose -f docker-compose.prod.yml up -d --build`
* `docker-compose -f docker-compose.prod.yml down -v`
* `docker-compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput`
* `ssh -i ~/.ssh/roll_tech.pem ubuntu@3.135.138.142`
* https://medium.com/@fullsour/how-to-switch-user-on-the-aws-cli-77c2b314e12d
* `aws ecr get-login-password --region us-east-2 --profile roll | docker login --username AWS --password-stdin 813539762970.dkr.ecr.us-east-2.amazonaws.com`
* `aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 813539762970.dkr.ecr.us-east-2.amazonaws.com`
* `scp -i ~/.ssh/roll_tech.pem -r $(pwd)/{roll,nginx,.env.prod,docker-compose.prod.yml} ubuntu@3.135.138.142:/home/ubuntu/app`
* 