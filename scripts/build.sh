#!/bin/sh

version=$1

docker build --platform linux/amd64 -t melkor73/goals-service:$version -t melkor73/goals-service:latest $PWD

docker push melkor73/goals-service:$version
docker push melkor73/goals-service:latest