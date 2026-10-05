import { Entity, model, property } from '@loopback/repository';

/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'organization_species' },
  },
})
export class OrganizationSpecies extends Entity {
  @property({
    type: Number,
    required: false,
    scale: 0,
    id: 1,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {
      columnName: 'organization_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  organizationId: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {
      columnName: 'species_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  speciesId: Number;

  @property({
    type: Boolean,
    required: false,
    postgresql: {
      columnName: 'is_active',
      dataType: 'boolean',
      nullable: 'NO',
    },
  })
  isActive: Boolean;

  @property({
    type: Date,
    required: false,
    postgresql: {
      columnName: 'time_created',
      dataType: 'timestamp',
      nullable: 'NO',
    },
  })
  timeCreated?: Date;

  @property({
    type: Date,
    required: false,
    postgresql: {
      columnName: 'time_updated',
      dataType: 'timestamp',
      nullable: 'NO',
    },
  })
  timeUpdated?: Date;

  [prop: string]: any;

  constructor(data?: Partial<OrganizationSpecies>) {
    super(data);
  }
}
export interface OrganizationSpeciesRelations {
  // describe navigational properties here
}

export type OrganizationSpeciesWithRelations = OrganizationSpecies &
  OrganizationSpeciesRelations;
