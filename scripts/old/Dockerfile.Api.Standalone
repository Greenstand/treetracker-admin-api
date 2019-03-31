FROM node:8.11-slim

ENV DIR /opt/admin-server
RUN mkdir -p ${DIR}/

COPY common/ ${DIR}/common
COPY server/ ${DIR}/server
COPY package*.json *.js ${DIR}/

WORKDIR $DIR
RUN npm install

ENTRYPOINT node server/server.js
