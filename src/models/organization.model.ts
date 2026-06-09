import { Entity, model, property } from '@loopback/repository';

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
  id: number;

  @property({
    type: String,
    postgresql: {
      columnName: 'name',
      dataType: 'character varying',
    },
  })
  name: string;

  @property({
    type: String,
    postgresql: {
      columnName: 'type',
      dataType: 'character varying',
    },
  })
  type: string;

  @property({
    type: String,
    postgresql: {
      dataType: 'uuid',
      dbDefault: 'uuid_generate_v4()',
    },
  })
  stakeholder_uuid: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Organization>) {
    super(data);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OrganizationRelations {
  // describe navigational properties here
}

export type OrganizationWithRelations = Organization & OrganizationRelations;
