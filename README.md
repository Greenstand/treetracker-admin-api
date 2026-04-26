# Treetracker Admin Panel – API

The Admin Panel is the part of the [Greenstand Treetracker project](https://github.com/Greenstand) for verifying, processing and managing data collected by the Treetracker app.

This is the RESTful API for the Admin Panel, built predominantly with [Loopback 4](https://loopback.io/doc/en/lb4/index.html).

The Admin Panel frontend is managed separately under [Greenstand/treetracker-admin-client](https://github.com/Greenstand/treetracker-admin-client).

See [Wiki](https://github.com/Greenstand/treetracker-admin-api/wiki) for more info on goals

Please add any missing content to this readme.

## Development Environment Quick Start

There are three main options for development in the Admin Panel:

1. For frontend work only
   1. Follow setup instructions in the [treetracker-admin-client](https://github.com/Greenstand/treetracker-admin-client) project
2. For API work only
   1. Fork and clone this repo as described below
   1. Use our development database credentials (available via team leads in Slack)
3. As a completely local development environment
   1. Install postgres and postgis locally, install a database seed, and run database migrations
   1. Install and run the backend API, configured to use your local database
   1. Install and run the frontend, configured to use you local backend API

### Step 1: Install git

See https://git-scm.com/downloads for instructions.

### Step 2: Install Node.js

_Node.js version 12.x works best for now; later versions have exhibited some strange behaviour with this project.
If you encounter issues with the server, check your version of Node.js first. This includes CORS related issues when fetching the API._

We recommend using [nvm](https://github.com/nvm-sh/nvm) to install and manage your Node.js instances. More details here: https://www.sitepoint.com/quick-tip-multiple-versions-node-nvm/

1. Install nvm: `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.2/install.sh | bash`
2. Install the latest version of Node.js 12: `nvm install 12`
3. Use the installed Node.js: `nvm use 12`

Alternatively, you can install Node.js directly from https://nodejs.org/dist/latest-v12.x/

_On MacOS, you can alleviate the need to run as sudo by using nvm or by [following John Papa's instructions](http://jpapa.me/nomoresudo)._

### Step 3: Fork and clone this repository

1. Click _Fork_ on this GitHub repo and follow the steps to fork the repo to your account
1. Open terminal
1. Go to a folder where you would like to install the project. Then type the following, replacing `<username>` with your GitHub username:

```
git clone https://github.com/<username>/treetracker-admin-api.git
```

Add Greenstand as a remote:

```
git remote add upstream https://github.com/Greenstand/treetracker-admin-api
```

### Step 4: Get configuration files

1. Get the server dev env file pinned to the #admin_panel_chat channel in Greenstand Slack: `.env.development` (Note that the leading `.` may be removed if you download the file from Slack, so you'll need to rename it). This contains PostgreSQL development database credentials.
1. Copy the file to the root directory of your local repo

### Step 5: Install npm dependencies

```
npm install
```

### Step 6: Start the API server

```
npm start
```

### Step 7: Start developing!

## Keycloak Setup For Organization Onboarding

The organization onboarding flow now relies on Keycloak for:

- authenticating `/api` requests with bearer tokens
- assigning the `org` realm role after organization creation
- exposing the created organization id in the token as `organization_id`

This setup uses two different Keycloak clients:

1. Frontend browser client
   - `treetracker-admin-client-fe`
   - used by `treetracker-admin-client`
   - issues the access token the frontend sends to the API
2. Backend admin/service client
   - `treetracker-admin-client-be`
   - used by `treetracker-admin-api`
   - uses service-account credentials to update user attributes and assign roles

### Keycloak Role

Create or confirm the existence of this realm role in the `treetracker` realm:

- `org`

This role is granted to a user after they successfully create an organization.

### Frontend Keycloak Client

Client name:

- `treetracker-admin-client-fe`

Recommended settings used by the current implementation:

- `Client authentication`: Off
- `Standard flow`: On
- `Direct access grants`: Off
- `Implicit flow`: Off
- `Service accounts roles`: Off

For local development, valid redirect URIs should include:

- `http://localhost:3001/*`
- `http://localhost:3001/auth/callback`

Web origins should include:

- `http://localhost:3001`

The frontend environment values currently used are:

```env
REACT_APP_KEYCLOAK_URL=https://dev-k8s.treetracker.org/keycloak
REACT_APP_KEYCLOAK_REALM=treetracker
REACT_APP_KEYCLOAK_CLIENT_ID=treetracker-admin-client-fe
```

### Backend Keycloak Admin Client

Client name:

- `treetracker-admin-client-be`

Recommended settings used by the current implementation:

- `Client authentication`: On
- `Service accounts roles`: On
- `Standard flow`: Off
- `Direct access grants`: Off

The backend uses this client to call the Keycloak Admin API.

The backend environment values currently used are:

```env
KEYCLOAK_URL=https://dev-k8s.treetracker.org/keycloak
KEYCLOAK_REALM=treetracker
KEYCLOAK_CLIENT_ID=treetracker-admin-client-be
KEYCLOAK_ADMIN_ID=treetracker-admin-client-be
KEYCLOAK_CLIENT_EXPECTED_CLIENT_ID=treetracker-admin-client-fe
KEYCLOAK_ADMIN_CLIENT_SECRET=<backend-client-secret>
```

Notes:

- `KEYCLOAK_CLIENT_EXPECTED_CLIENT_ID` is the frontend client id expected in the token `azp` claim.
- `KEYCLOAK_ADMIN_ID` is the service-account client used by the API for admin calls.
- Do not use the frontend client for backend admin role assignment.

### Backend Service Account Permissions

For `treetracker-admin-client-be`, assign the required `realm-management` roles to the service account so the API can:

- read realm roles
- update users
- assign realm roles to users

Admin Console steps:

1. Open the `treetracker` realm in the Keycloak Admin Console.
2. Go to `Clients`.
3. Select `treetracker-admin-client-be`.
4. Confirm these settings are enabled on the client:
   - `Client authentication`: On
   - `Service accounts roles`: On
5. Open the `Service account roles` tab for `treetracker-admin-client-be`.
6. In the client-role selector, choose `realm-management`.
7. Add the required roles to the service account.

At minimum, review and grant the needed permissions for:

- `manage-users`
- `view-realm`

If role fetch/assignment still fails with `403`, also review:

- `query-users`
- `query-roles`

After saving the roles, the backend service account should be able to:

- fetch the `org` realm role
- update a user’s `organization_id` attribute
- assign the `org` realm role to the user

### Add The `organization_id` Claim To Frontend Tokens

The backend stores the created organization id as a Keycloak user attribute:

- `organization_id`

To expose that value in the frontend access token, add a mapper on the frontend client's dedicated scope.

Client:

- `treetracker-admin-client-fe`

Dedicated scope:

- `treetracker-admin-client-fe-dedicated`

Admin Console steps:

1. Open the `treetracker` realm in the Keycloak Admin Console.
2. Go to `Clients`.
3. Select `treetracker-admin-client-fe`.
4. Open `Dedicated scopes`.
5. Select `treetracker-admin-client-fe-dedicated`.
6. Open the `Mappers` tab.
7. Click `Add mapper`.
8. Choose `By configuration`.
9. Choose `User Attribute`.

Create a mapper with these exact values:

- `Mapper Type`: `User Attribute`
- `Name`: `organization_id`
- `User Attribute`: `organization_id`
- `Token Claim Name`: `organization_id`
- `Claim JSON Type`: `String`
- `Add to access token`: On
- `Add to ID token`: Optional
- `Multivalued`: Off

Notes:

- The user attribute name must match exactly: `organization_id`
- The token claim name must match exactly: `organization_id`
- The frontend currently reads the claim from the refreshed access token, so `Add to access token` must be enabled

```

To verify the mapper is working:

1. Confirm the Keycloak user has the `organization_id` attribute set in the user profile.
2. Log out of the frontend application.
3. Log back in so a new token is issued.
4. Decode the refreshed access token and confirm it contains:
   - `realm_access.roles` including `org`
   - `organization_id`

### Backend Organization Creation Flow

When a user creates an organization through the API, the backend now does the following:

1. creates the organization row in the database
2. sets the Keycloak user attribute:
   - `organization_id`
3. assigns the `org` realm role to the user


### Troubleshooting

- If the frontend token contains `org` but not `organization_id`, verify the frontend client mapper.
- If organization creation succeeds but claim/role assignment fails with `403`, verify the backend service-account permissions in Keycloak.
- The API currently verifies Keycloak bearer tokens using `jose`, not `keycloak-connect`.

## Commit Message and PR Title Format

We use automatic semantic versioning, which looks at commit messages to determine how to increment the version number for deployment.

Your commit messages will need to follow the [Conventional Commits](https://www.conventionalcommits.org/) format, for example:

```

feat: add new button

```

Since we squash commits on merging PRs into `master`, this applies to PR titles as well.

## Keeping Your Fork in Sync

Your forked repo won't automatically stay in sync with Greenstand, so you'll need to occassionally sync manually (typically before starting work on a new feature).

```

git pull upstream master --rebase
git push origin master

```

You might also need to sync and merge `master` into your feature branch before submitting a PR to resolve any conflicts.

```

git checkout <feature_branch>
git merge master

````

## Code style guide

We follow the Airbnb JavaScript style guide. The superficial aspects of this style are enforced by a pre-commit hook in the project that runs [Prettier](https://prettier.io/) when you commit a change.

If you are using VSCode as your IDE, please follow [this guide](https://www.digitalocean.com/community/tutorials/how-to-format-code-with-prettier-in-visual-studio-code) to set up Prettier and automatically format your code on file save.

You can also manually run `npm run prettier`. Configuration files are already included in this repo.

### Rules

**Indention** 2 Spaces for indentation

**Semicolon** Use semicolons at the end of each line

**Characters** 80 characters per line

**Quotes** Use single quotes unless you are writing JSON

```js
const foo = 'bar';
````

**Braces** Opening braces go on the same line as the statement

```js
if (true) {
  console.log('here');
}
```

**Variable declaration** Declare one Variable per statement

```js
const dog = ['bark', 'woof'];
let cat = ['meow', 'sleep'];
```

**Variable, properties and function names** Use lowerCamelCase for variables, properties and function names

```js
const adminUser = db.query('SELECT * From users ...');
```

**Class names** Use UpperCamelCase for class names

```js
class Dog {
  bark() {
    console.log('woof');
  }
}
```

**Descriptive conditions** Make sure to have a descriptive name that tells the use and meaning of the code

```js
const isValidPassword =
  password.length >= 4 && /^(?=.*\d).{4,}$/.test(password);
```

**Object/Array creation** Use trailing commas and put short declarations on a single line. Only quote keys when your interpreter complains:

```js
var a = ['hello', 'world'];
var b = {
  good: 'code',
  'is generally': 'pretty',
};
```

## Testing

We used a combination of JS and Typescript, and because Loopback would load services/controllers from the typescript output folder (dist), it can be tricky to test.

For the goal of protecting the shared development database, when running test, we will use a separate database.

Create a test environment file `.env.test` in the root directory with the test database URL set as follows:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?ssl=true
```

NOTE: Please do not set this URL to point to our development database, because the tests will clear all the data in the database. It would cause trouble if we don't have any data in the dev DB.

To locally install postgresDB, this app might be helpful: https://postgresapp.com/

To run test:

```
npm test
```

To make the test process more smooth, we suggest running a command to compile the Loopback files automatically when files change:

```
npm run watch
```

In this way, we can write the code and get the tests result immediately.

NOTE: when running tests, the files related to Loopback are loaded from ./dist folder. That's because for Jest does not output compiled files at all, and Loopback will try to load the controllers at runtime.

## Advanced local development using docker _## Currently broken ##_

For developers familiar with docker, we offer a dockerized setup for local development.

To run docker on a local machine, you will have to install Docker first.
Docker is a linux container technology, so running it on Mac or Windows requires an application with an attached linux VM.
Docker provides one for each OS by default.

### Mac

Install Docker for Mac using homebrew, using the following command

```
$ brew cask install docker
```

You can alternatively install Docker via: [Docker for Mac](https://docs.docker.com/docker-for-mac/install/)

Once Docker is installed, lauch Docker from the Applications GUI.

### Windows

For most versions of Windows: [Docker for Windows](https://docs.docker.com/docker-for-windows/install/)

For some older versions or Win10 Home: [Docker Toolbox](https://docs.docker.com/toolbox/toolbox_install_windows/).
At least on one machine, to get this to work, when you get to the step to do QuickStart terminal script, instead, run:

```
docker-machine create default --virtualbox-no-vtx-check
```

then re-run the QuickStart terminal script.

> If you use Docker Toolbox, check the IP address in the output of the QuickStart terminal script.
> You will use this IP address later instead of `localhost`.

### Linux

To install on linux, you can run
`sudo apt-get install -y docker-ce`
but there is [additional setup](https://docs.docker.com/install/linux/docker-ce/ubuntu/#set-up-the-repository) to verify keys, etc.

### Install, build docker containers and go

Run the setup script. This script installs node modules, builds docker containers, and starts them

```
./dev/scripts/setup.sh
```

You can now view the Treetracker Admin Panel at http://localhost:8080.

> Note: If you try to access the site on port 3001 you will recieve a CORS error

> Note: If you used Docker Toolbox, you may need to use the IP address it reported, such as http://192.168.99.100:8080_

It may take a few seconds for the web and api servers to come up. You can monitor them using the docker logs commands as:

```
docker logs -f treetracker-admin-web
docker logs -f treetracker-admin-api
```

Also see [Scripts](#scripts) below

To stop the dev environment use

```
./dev/scripts/down.sh
```

To start the dev environment back up use

```
./dev/scripts/up.sh
```

Just edit as you normally would to view changes in your development environment.

### Alternative setup for MS Windows (Works on Linux and Mac also)

On Windows the easiest way to develop and debug Node.js applications is using Visual Studio Code.
It comes with Node.js support out of the box.

https://code.visualstudio.com/docs

### Still can not figure it out?

Here is our [wiki page for troubleshooting](https://github.com/Greenstand/treetracker-admin/wiki/Set-Up-Issues), take a look.

Help us to improve it by adding your experience solving this problem.

### Scripts

Useful scripts are contained in /dev/scripts. Their uses are described here. Scripts are run from the repository root as /dev/scripts/{script-name}.sh

**install.sh** install or update npm modules for server and client projects

**build.sh** build docker images

**up.sh** bring up docker containers in docker as described by docker-compose.yml

**setup.sh** run install.sh, build.sh, and up.sh

**down.sh** bring down docker containers

**logs-api.sh** show logs for api server

**logs-web.sh** show logs for React.js dev server

**docker-clear-images.sh** clear out _all_ docker images

**docker-remove-containers.sh** clear out _all_ docker containers

## Further reading

See [Contributing to the Cause](https://github.com/Greenstand/Development-Overview#contributing-to-the-cause)
