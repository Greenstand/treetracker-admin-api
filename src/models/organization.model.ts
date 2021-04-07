import { Entity, model, property } from '@loopback/repository';

/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'entity' },
  },
})
export class Organization extends Entity {
  @property({
    type: Number,
    id: 1,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
    },
  })
  id: Number;

  @property({
    type: String,
    postgresql: {
      columnName: 'name',
      dataType: 'character varying',
    },
  })
  name: String;

  @property({
    type: String,
    postgresql: {
      columnName: 'type',
      dataType: 'character varying',
    },
  })
  type: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Organization>) {
    super(data);
  }
}

export interface OrganizationRelations {
  // describe navigational properties here
}

export type OrganizationWithRelations = Organization & OrganizationRelations;
