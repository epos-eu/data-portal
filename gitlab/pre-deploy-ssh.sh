#!/bin/sh -e
apt-get update && apt-get install -y rsync && apt-get -y install ssh
mkdir -p ~/.ssh
ssh-keyscan -H $LIVE_SERVER >> ~/.ssh/known_hosts
echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa