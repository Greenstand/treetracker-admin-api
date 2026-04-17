import { Entity, model, property } from '@loopback/repository';

/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'grower_note' },
  },
})
export class GrowerNote extends Entity {
  @property({
    type: Number,
    required: false,
    scale: 0,
    id: 1,
    postgresql: {
      columnName: 'id',
      dataType: 'serial',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {
      columnName: 'planter_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  planterId: Number;

  @property({
    type: String,
    required: true,
    postgresql: {
      columnName: 'content',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  content: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {
      columnName: 'author_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  authorId: Number;

  @property({
    type: String,
    required: true,
    postgresql: {
      columnName: 'author_name',
      dataType: 'character varying',
      dataLength: 255,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  authorName: String;

  @property({
    type: String,
    required: false,
    postgresql: {
      columnName: 'created_at',
      dataType: 'timestamp without time zone',
      dataLength: null,
      dataPrecision: 6,
      dataScale: null,
      nullable: 'YES',
    },
  })
  createdAt?: String;

  @property({
    type: String,
    required: false,
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamp without time zone',
      dataLength: null,
      dataPrecision: 6,
      dataScale: null,
      nullable: 'YES',
    },
  })
  updatedAt?: String;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<GrowerNote>) {
    super(data);
  }
}

export interface GrowerNoteRelations {}

export type GrowerNoteWithRelations = GrowerNote & GrowerNoteRelations;
