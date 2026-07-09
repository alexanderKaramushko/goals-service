#!/bin/sh

tag=$1

docker build --platform linux/amd64 -t melkor73/goals-service:$tag -t melkor73/goals-service:latest $PWD

docker push melkor73/goals-service:$tag
docker push melkor73/goals-service:latest