import { Entity, model, property } from '@loopback/repository';

/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'tree_species' },
  },
})
export class Species extends Entity {
  @property({
    type: Number,
    required: false,
    scale: 0,
    id: 1,
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
    type: String,
    required: false,
    postgresql: {
      columnName: 'uuid',
      dataType: 'varchar',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  uuid: String;

  @property({
    type: String,
    required: false,
    length: 45,
    postgresql: {
      columnName: 'name',
      dataType: 'character varying',
      dataLength: 45,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  name: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {
      columnName: 'desc',
      dataType: 'character varying',
      dataLength: 255,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  desc: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {
      columnName: 'active',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  active: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {
      columnName: 'value_factor',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'YES',
    },
  })
  valueFactor?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Species>) {
    super(data);
  }
}

export interface SpeciesRelations {
  // describe navigational properties here
}

export type SpeciesWithRelations = Species & SpeciesRelations;
