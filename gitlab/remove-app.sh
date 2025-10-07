#!/bin/sh
PROJECT_NAME="$1"
[[ -z "$PROJECT_NAME" ]] && { echo "PROJECT_NAME is empty" ; exit 1; }
cd /opt/node-apps/$PROJECT_NAME/gitlab
ansible-playbook nginx-remove.yml --extra-vars "project_name=$PROJECT_NAME"
rm -rf /opt/node-apps/$PROJECT_NAME
