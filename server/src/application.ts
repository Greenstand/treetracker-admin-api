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
    
    // Configure database with env. variables.  
    // First, bind configuration to treetracker source.
    this.bind('datasources.config.treetracker').to({
      name: process.env.DB_NAME, 
      connector: process.env.DB_CONNECTOR, 
      url: process.env.DB_URL, 
      port: process.env.DB_PORT, 
    });

    /* Then, bind treetracker source to TreetrackerDataSource Class. 
    Scope of TreetrackerDataSource: Transient*/
    this.bind('datasources.treetracker').toClass(TreetrackerDataSource);
    
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
