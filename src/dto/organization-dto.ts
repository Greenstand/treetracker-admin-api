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

const ORGANIZATION_PROPERTIES = {
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
};

export const ORGANIZATION_REQUEST_SCHEMA: SchemaObject = {
  type: 'object',
  required: ['name', 'email'],
  additionalProperties: false,
  properties: ORGANIZATION_PROPERTIES,
  errorMessage: {
    required: {
      name: 'Name is required',
      email: 'Email is required',
    },
    additionalProperties: 'Only supported organization fields are allowed',
  },
};

// PATCH allows partial updates, so no field is required, but the same
// per-field validations and the closed field set still apply.
export const ORGANIZATION_UPDATE_REQUEST_SCHEMA: SchemaObject = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: ORGANIZATION_PROPERTIES,
  errorMessage: {
    minProperties: 'At least one organization field is required',
    additionalProperties: 'Only supported organization fields are allowed',
  },
};
