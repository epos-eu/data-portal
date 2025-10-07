#!/bin/sh -e
kubectl config set-cluster $K8S_CLUSTER --server="https://$K8S_HOST:$K8S_PORT" --insecure-skip-tls-verify
kubectl config set-credentials $K8S_SERVICEACCOUNT --token="$K8S_TOKEN"
kubectl config set-context "$K8S_CLUSTER-$K8S_NAMESPACE" --cluster=$K8S_CLUSTER --namespace=$K8S_NAMESPACE --user=$K8S_SERVICEACCOUNT
kubectl config use-context "$K8S_CLUSTER-$K8S_NAMESPACE"
sed -i "s|REDEPLOY|$(date)|g" ./gitlab/k8-deploy.yml
sed -i "s|IMAGE-TAG|$CI_COMMIT_REF_SLUG|g" ./gitlab/k8-deploy.yml
sed -i "s|DOCKER_REGISTRY|$CI_REGISTRY|g" ./gitlab/k8-deploy.yml
