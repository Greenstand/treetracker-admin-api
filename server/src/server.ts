//import {once} from 'events';
import {Request, Response} from 'express';
import cors from "cors";
import * as http from 'http';
import * as path from 'path';
import express from 'express';
import {ApplicationConfig, TreetrackerAdminApiApplication} from './application';
const {auth} = require('./js/auth.js');
const {auditMiddleware} = require('./js/Audit');
const listEndpoints = require('express-list-endpoints')

//TODO import better
//const express = require('express').default;

export {ApplicationConfig};

export class ExpressServer {
  public readonly app: express.Application;
  public readonly lbApp: TreetrackerAdminApiApplication;
  private server?: http.Server;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    this.lbApp = new TreetrackerAdminApiApplication(options);

    // Expose the front-end assets via Express, not as LB4 route
    this.app.use("/api", auth.isAuth);
    this.app.use("/auth", auth.isAuth);

    //audit
    this.app.use(auditMiddleware);

    this.app.use('/api', this.lbApp.requestHandler);
    //the auth: login...
    this.app.use('/auth', auth.router);


    // Custom Express routes
    this.app.get('/', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/express.html'));
    });

    // Serve static files in the public folder
    this.app.use(express.static(path.join(__dirname, '../public')));


    console.log("print:", listEndpoints(this.app));
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port || 3000;
//    const host = this.lbApp.restServer.config.host || '0.0.0.0';
    const host = '0.0.0.0';
    console.log(`listerning at: ${host}:${port}`);
    this.server = this.app.listen(port, host);
    //await once(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    //await this.lbApp.stop();
    this.server.close();
    //await once(this.server, 'close');
    this.server = undefined;
  }
}
