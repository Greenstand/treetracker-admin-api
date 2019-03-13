#!/bin/bash

docker build . -f dev/Dockerfile.ReverseProxy -t treetracker-reverse-proxy:latest
docker build . -f dev/Dockerfile.Web -t treetracker-admin-web:latest
docker build . -f dev/Dockerfile.API -t treetracker-admin-api:latest
