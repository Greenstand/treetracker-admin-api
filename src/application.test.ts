import { RestBindings } from '@loopback/rest';

import { TreetrackerAdminApiApplication } from './application';

describe('TreetrackerAdminApiApplication', () => {
  it('strips ajv params from validation errors', async () => {
    const app = new TreetrackerAdminApiApplication();
    const options = await app.get(RestBindings.REQUEST_BODY_PARSER_OPTIONS);
    const transformedErrors = options.validation?.ajvErrorTransformer?.([
      {
        keyword: 'pattern',
        instancePath: '/phone',
        schemaPath: '#/properties/phone/pattern',
        params: {
          pattern: '^(?:$|(?=(?:.*\\d){10,})[+()\\-.\\s\\d]{10,20})$',
        },
        message: 'must match pattern',
      } as never,
    ]);

    expect(transformedErrors).toEqual([
      expect.objectContaining({
        keyword: 'pattern',
        instancePath: '/phone',
        schemaPath: '#/properties/phone/pattern',
        message: 'must match pattern',
      }),
    ]);
    expect(transformedErrors?.[0]).not.toHaveProperty('params');
  });
});
