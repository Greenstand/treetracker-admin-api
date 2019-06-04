# treetracker-admin
This portion of the project is to process tree data. TreeTracker's Admin Panel Frontend and RESTful API built with loopback.

See [Wiki](https://github.com/Greenstand/treetracker-admin-api/wiki) for more info on goals

See [Project Board](https://github.com/orgs/Greenstand/projects/6)

See [Contributing to The Cause](https://github.com/Greenstand/Development-Overview#contributing-to-the-cause)

Please add any missing content to this readme.

## Requirements

- Install Node
   - on OSX , install git and type `brew install git`
   - on OSX, install [home brew](http://brew.sh/) and type `brew install node`
   - on Windows, use the installer available at [nodejs.org](http://nodejs.org/)
   - On OSX you can alleviate the need to run as sudo by [following John Papa's instructions](http://jpapa.me/nomoresudo)
- Open terminal
- Go to a folder where you would like to install the project. Then type the following:
 ```bash
 git clone https://github.com/Greenstand/treetracker-admin.git
 ```
Once cloned type:
```bash
cd treetracker-admin/server && touch server/config/datasources.json && npm install
```

## Setup

In `server/server/config` directory you will need to create a `datasources.json` file that will be used to reference the source of data for Loopback.

Contact the project maintainer on Slack to request access to our development database. 

## Development Environment Quick Start

We provide a development environment through docker that can run on your local environment.

### Set Up Docker
To run docker on a local machine, you will have to install Docker first. Docker is a linux container technology, so running it on Mac or Windows requires an application with an attached linux VM. Docker provides one for each OS by default.

Install Docker for Mac using homebrew, using the following command

```
$ brew cask install docker
```

You can alternatively install Docker via:  [Docker for Mac] (https://docs.docker.com/docker-for-mac/install/)

Once Docker is installed, lauch Docker from the Applications GUI.



[Docker for Windows](https://docs.docker.com/docker-for-windows/install/)

To install on linux, you can run `sudo apt-get install -y docker-ce` but there is [additional setup](https://docs.docker.com/install/linux/docker-ce/ubuntu/#set-up-the-repository) to verify keys, etc.


### Install, build docker containers and go

Install Node (see Requirements above)

Clone this repository

```
git clone git@github.com:Greenstand/treetracker-admin.git
cd treetracker-admin
```

Run the setup script.  This script installs node modules, builds docker containers, and starts them
```
./dev/setup.sh
```


You can now view the treetracker admin at http://localhost:8080.

It may take a few seconds for the web and api servers to come up.  You can monitor them using the docker logs commands as:

```
docker logs -f treetracker-admin-web
docker logs -f treetracker-admin-api

```

The REST API documentation can be viewed and explored by visiting http://localhost:3000/explorer


To stop the dev environment use

```
./dev/down.sh
```

To start the dev environment back up use

```
./dev/up.sh
```


Just edit as you normally would to view changes in your development environment.


### Alternative setup for MS Windows (Works on Linux and Mac also)
On Windows the easiest way to develop and debug Node.js applications is using Visual Studio Code.
It comes with Node.js support out of the box.

https://code.visualstudio.com/docs




## Quick Start For API only development

Run the following command to start the REST API.

```
$ npm run start
```

Run the following command to run the linter.

```
$ npm run lint
```

## Credit
-----------
- [Loopback](https://loopback.io/doc/en/lb3/index.html)
