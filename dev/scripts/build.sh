#!/bin/bash

docker build . -f dev/dockerfiles/Dockerfile.ReverseProxy -t treetracker-reverse-proxy:latest
docker build . -f dev/dockerfiles/Dockerfile.Web -t treetracker-admin-web:latest
docker build . -f dev/dockerfiles/Dockerfile.API -t treetracker-admin-api:latest
