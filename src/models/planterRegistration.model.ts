import { Entity, model, property } from '@loopback/repository';

/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'planter_registrations' },
  },
})
export class PlanterRegistration extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: Number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'planter_id',
      dataType: 'integer',
    },
  })
  planterId: number;

  @property({
    type: 'date',
    required: true,
    dataType: 'timestamp without time zone',
    postgresql: {
      columnName: 'created_at',
    },
  })
  createdAt: string;

  @property({
    type: 'number',
    required: false,
    dataType: 'latitude',
    postgresql: {
      columnName: 'lat',
    },
  })
  lat: number;

  @property({
    type: 'number',
    required: false,
    dataType: 'longitude',
    postgresql: {
      columnName: 'lon',
    },
  })
  lon: number;

  @property({
    type: String,
    required: false,
    postgresql: {
      columnName: 'device_identifier',
      dataType: 'character varying',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  deviceIdentifier?: Number;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<PlanterRegistration>) {
    super(data);
  }
}

export interface PlanterRegistrationRelations {
  // describe navigational properties here
}

export type PlanterRegistrationWithRelations = PlanterRegistration &
  PlanterRegistrationRelations;
