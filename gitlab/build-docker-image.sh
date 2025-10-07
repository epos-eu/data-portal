#!/bin/sh -e
echo 'stop existing docker container'
if [ -n "$(docker ps -f="name=epos-gui-builder" -a -q)" ]; then docker stop $(docker ps -f="name=epos-gui-builder" -a -q); fi
if [ -n "$(docker ps -f="name=epos-gui" -a -q)" ]; then docker stop $(docker ps -f="name=epos-gui" -a -q); fi

echo 'remove existing docker container'
if [ -n "$(docker ps -f="name=epos-gui-builder" -a -q)" ]; then docker rm $(docker ps -f="name=epos-gui-builder" -a -q); fi
if [ -n "$(docker ps -f="name=epos-gui" -a -q)" ]; then docker rm $(docker ps -f="name=epos-gui" -a -q); fi

echo 'build intermediate (builder) docker image'
docker build -f Dockerfile.build -t epos-gui-builder:latest ../

echo 'remove dist folder from host'
rm -rf dist

echo 'start docker builder server'
docker run -d --rm --name epos-gui-builder -td epos-gui-builder

echo 'copy built files to host'
docker cp epos-gui-builder:/opt/epos-gui/dist/ ../

echo 'stop docker builder server'
if [ -n "$(docker ps -f="name=epos-gui-builder" -a -q)" ]; then docker stop $(docker ps -f="name=epos-gui-builder" -a -q); fi

echo 'build final docker image'
docker build -f Dockerfile.deploy -t epos-gui:latest ../

echo 'run docker image'
docker run -d --rm -p 8080:80 --name epos-gui -td epos-gui
