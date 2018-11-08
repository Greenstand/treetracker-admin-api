#cd client
#npm install
#npm run build
#cd ../


docker build . -f container/Dockerfile.ReverseProxy -t treetracker-reverse-proxy:latest
docker build . -f container/Dockerfile.Web -t treetracker-admin:latest
docker build . -f container/Dockerfile.API -t treetracker-admin-api:latest

docker-compose -f container/docker-compose.yml up -d 

#echo "Stopping containers"
#docker stop $CONTAINER_NAME
#docker rm $CONTAINER_NAME

#echo "Starting container"
#docker run -d  -p80:8080 -p3000:3000  --name=treetracker-admin-dev   -v $(pwd):/opt/admin-api-server --name $CONTAINER_NAME  treetracker-admin-dev:latest
