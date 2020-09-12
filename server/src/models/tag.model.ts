import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'tag'}},
})
export class Tag extends Entity {
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
      columnName: 'tag_name',
      dataType: 'character varying',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  tagName: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {
      columnName: 'active',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  active: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {
      columnName: 'public',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  public: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Tag>) {
    super(data);
  }
}

export interface TagRelations {
  // describe navigational properties here
}

export type TagWithRelations = Tag & TagRelations;
