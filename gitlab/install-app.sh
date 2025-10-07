#!/bin/sh
PROJECT_NAME="$1"
if [ -z "$PROJECT_NAME" ]; then
    echo "PROJECT_NAME is empty"
    exit 1
fi
cd /opt/node-apps/$PROJECT_NAME/gitlab
ansible-playbook nginx-add.yml --extra-vars "project_name=$PROJECT_NAME"
