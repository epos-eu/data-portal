#!/bin/sh -e
# Add server fingerprint
mkdir -p ~/.ssh
ssh-keyscan -H $GIT_SERVER >> ~/.ssh/known_hosts
# Add ssh config
echo "$GIT_DEPLOY_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/git_deploy
chmod 600 ~/.ssh/git_deploy
echo "Host $GIT_SERVER\nRSAAuthentication yes\nIdentityFile ~/.ssh/git_deploy" > ~/.ssh/config
# Rewrite git/npm urls
git config --global url."git@$GIT_SERVER:".insteadOf "https://kwvmxgit.ad.nerc.ac.uk/"