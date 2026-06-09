import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication, RestBindings } from '@loopback/rest';
import { RestExplorerComponent } from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { MySequence } from './sequence';

export { ApplicationConfig };

export class TreetrackerAdminApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // use for showing custom erros
    this.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
      validation: {
        ajvErrors: {},
        ajvErrorTransformer: (errors) =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          errors.map(({ params, ...error }) => error) as typeof errors,
      },
    });

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.component(RestExplorerComponent);

    this.projectRoot = options.projectRoot || __dirname;
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
