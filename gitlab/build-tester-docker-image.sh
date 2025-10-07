#!/bin/sh -e
echo 'stop existing docker container'
if [ -n "$(docker ps -f="name=node-chrome-tester" -a -q)" ]; then docker stop $(docker ps -f="name=node-chrome-tester" -a -q); fi

echo 'remove existing docker container'
if [ -n "$(docker ps -f="name=node-chrome-tester" -a -q)" ]; then docker rm $(docker ps -f="name=node-chrome-tester" -a -q); fi

echo 'build docker image'
sudo docker build -t node-chrome-tester:latest ../

echo 'run docker image'
docker run --name node-chrome-tester -td node-chrome-tester
