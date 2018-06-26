FROM node:8.11-slim

ENV DIR /opt/admin-server
RUN mkdir -p ${DIR}/

COPY client/ ${DIR}/client
COPY common/ ${DIR}/common
COPY scripts/ ${DIR}/scripts
COPY server/ ${DIR}/server
COPY .yo-rc.json package*.json *.js ${DIR}/

WORKDIR $DIR
RUN npm install

ENTRYPOINT node server/server.js
