import { SchemaObject } from '@loopback/openapi-v3';

const PHONE_REGEX = /^(?:$|(?=(?:.*\d){10,})[+()\-.\s\d]{10,20})$/;

function optionalStringProperty(fieldLabel: string): SchemaObject {
  return {
    type: 'string',
    errorMessage: {
      type: `${fieldLabel} must be a string`,
    },
  } as SchemaObject;
}

function optionalUrlProperty(fieldLabel: string): SchemaObject {
  return {
    anyOf: [
      { type: 'string', maxLength: 0 },
      { type: 'string', format: 'uri' },
    ],
    errorMessage: {
      anyOf: `${fieldLabel} must be empty or a valid URL`,
    },
  } as SchemaObject;
}

function optionalPhoneProperty(fieldLabel: string): SchemaObject {
  return {
    type: 'string',
    pattern: PHONE_REGEX.source,
    errorMessage: {
      type: `${fieldLabel} must be a string`,
      pattern: `${fieldLabel} must be empty or a valid phone number`,
    },
  } as SchemaObject;
}

export const ORGANIZATION_REQUEST_SCHEMA: SchemaObject = {
  type: 'object',
  required: ['name', 'email'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      errorMessage: {
        type: 'Name must be a string',
        minLength: 'Name is required',
      },
    } as SchemaObject,
    email: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: {
        type: 'Email must be a string',
        minLength: 'Email is required',
        format: 'Email must be a valid email address',
      },
    } as SchemaObject,
    phone: optionalPhoneProperty('Phone'),
    website: optionalUrlProperty('Website'),
    logoUrl: optionalUrlProperty('Logo URL'),
    mapName: optionalStringProperty('Map name'),
  },
  errorMessage: {
    required: {
      name: 'Name is required',
      email: 'Email is required',
    },
    additionalProperties: 'Only supported organization fields are allowed',
  },
};
