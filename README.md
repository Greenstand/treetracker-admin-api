# treetracker-admin-api
 
 This API microservice is for access controlled CRUD for administrative access to treetracker data.
 
 This API is initially based off the treetracker-map-api repository

# Local Setup
1. Install treetracker-admin-api repo
2. Install nginx locally (brew install nginx)
3. Install treetracker-admin-api/scripts/nginx-treetracker-admin as the default nginx server
4. Start nginx
5. export NODE_PORT=3001
6. start treetracker-admin-api (node index.js)
7. Install treetracker-admin repo to nginx default directory
