#!/bin/sh -e
git config --global credential.helper store
echo "https://$GIT_DEPLOY_USER:$GIT_DEPLOY_PASS@$GIT_SERVER" > ~/.git-credentials
# Rewrite git/npm urls
git config --global url."https://$GIT_SERVER/".insteadOf "https://kwvmxgit.ad.nerc.ac.uk/"
git config --global url."https://$GIT_SERVER/".insteadOf "https://kwvmxgit.ad.nerc.ac.uk/"