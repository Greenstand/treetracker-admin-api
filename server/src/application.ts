import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {MySequence} from './sequence';
import { TreetrackerDataSource } from './datasources';
import { prototype } from 'events';

export {ApplicationConfig};

export class TreetrackerAdminApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Inject datasource. 
    this.dataSource(new TreetrackerDataSource({
      name: process.env.DB_NAME, 
      connector: process.env.DB_CONNECTOR, 
      url: process.env.DB_URL, 
      host: process.env.DB_HOST, 
      port: process.env.DB_PORT, 
      user: process.env.DB_USER, 
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_DATABASE
    }));
    
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
//import {BootMixin} from '@loopback/boot';
//import {RepositoryMixin} from '@loopback/repository';
//import {ApplicationConfig} from '@loopback/core';
//import {
//  RestExplorerBindings,
//  RestExplorerComponent,
//} from '@loopback/rest-explorer';
//import {RestApplication} from '@loopback/rest';
//import * as path from 'path';
//import {MySequence} from './sequence';
//import {TreesRepository} from './repositories';
//
//
//export class TreetrackerAdminApiApplication extends BootMixin(RepositoryMixin(RestApplication)) {
//    constructor(options: ApplicationConfig = {}) {
//    super(options);
//
//    // Set up the custom sequence
//    this.sequence(MySequence);
//
//    // Set up default home page
//    this.static('/', path.join(__dirname, '../public'));
//
//    // Customize @loopback/rest-explorer configuration here
//    this.bind(RestExplorerBindings.CONFIG).to({
//      path: '/explorer',
//    });
//    this.component(RestExplorerComponent);
//
//    this.projectRoot = __dirname;
//    // Customize @loopback/boot Booter Conventions here
//    this.bootOptions = {
//      controllers: {
//        // Customize ControllerBooter Conventions here
//        dirs: ['controllers'],
//        extensions: ['.controller.js'],
//        nested: true,
//      }
//    };
//  }
//}
