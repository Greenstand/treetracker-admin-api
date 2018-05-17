# treetracker-admin-api
 
 This is the TreeTracker's Admin Panel RESTful API.

 It is developed using Node.js and based on the library LoopBack v3: https://loopback.io/doc/en/lb3/index.html.

# Local Setup
1. Install treetracker-admin-api repo
2. Install nginx locally (brew install nginx)
3. Install treetracker-admin-api/scripts/nginx-treetracker-admin as the default nginx server
4. Start nginx
5. export NODE_PORT=3001
6. start treetracker-admin-api (node index.js)
7. Install treetracker-admin repo to nginx default directory

## Alternative setup for MS Windows (Works on Linux and Mac also)
On Windows the easiest way to develop and debug Node.js applications is using Visual Studio Code.
It comes with Node.js support out of the box.

https://code.visualstudio.com/docs