import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, postgresql: {schema: 'public', table: 'tree_tags'}}})
export class Tag extends Entity {
  @property({
    type: Number,
    required: false,
    scale: 0,
    id: 1,
    postgresql: {"columnName":"id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  id: Number;

  @property({
    type: String,
    required: false,
    length: 45,
    postgresql: {"columnName":"value","dataType":"character varying","dataLength":45,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  value: String;

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
