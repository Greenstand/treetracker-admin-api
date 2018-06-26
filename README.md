# treetracker-admin-api

  >  TreeTracker's Admin Panel RESTful API built with loopback.

## Requirements

- Install Node
   - on OSX, install [home brew](http://brew.sh/) and type `brew install node`
   - on Windows, use the installer available at [nodejs.org](http://nodejs.org/)
   - On OSX you can alleviate the need to run as sudo by [following John Papa's instructions](http://jpapa.me/nomoresudo)
- Open terminal
- Type `npm install`

## Setup

In `server` directory you will need to create a `datasources.json` file that will be used to reference the source of data for Loopback.

Contact the project maintainer to learn more.


## Quick Start

Run the following command to start the REST API.

```
$ npm run start
```

Run the following command to run the linter.

```
$ npm run lint
```

## Docker Setup

To run docker on a local machine, you will have to install Docker first. Docker is a linux container technology, so running it on Mac or Windows requires an application with an attached linux VM. Docker provides one for each OS by default.

[Docker for Mac](https://docs.docker.com/docker-for-mac/install/)
[Docker for Windows](https://docs.docker.com/docker-for-windows/install/)

To install on linux, you can run `sudo apt-get install -y docker-ce` but there is [additional setup](https://docs.docker.com/install/linux/docker-ce/ubuntu/#set-up-the-repository) to verify keys, etc.


### Dockerw script

Run `./dockerw build` to build the image of the mobile API locally using defaults, and to run the image use `./dockerw run`.

To see what arguments can be passed, simply run `./dockerw`. In order to use something created in the `build` mode, you must specify the same arguments in the `run` mode or it will attempt to pull the image. There is also an `up` mode that can be used, to build and run in one command with the same arguments.

There is a server/datasources.json file that is created if one does not exist, which is for connecting to the database. Please edit this to refer to any test databases you are using.

## Alternative setup for MS Windows (Works on Linux and Mac also)
On Windows the easiest way to develop and debug Node.js applications is using Visual Studio Code.
It comes with Node.js support out of the box.

https://code.visualstudio.com/docs

## Credit
-----------
- [Loopback](https://loopback.io/doc/en/lb3/index.html)
