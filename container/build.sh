docker build . -f container/Dockerfile.ReverseProxy -t treetracker-reverse-proxy:latest
docker build . -f container/Dockerfile.Web -t treetracker-admin:latest
docker build . -f container/Dockerfile.API -t treetracker-admin-api:latest

