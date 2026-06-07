import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'tag' },
  },
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
  id: number;

  @property({
    type: String,
    required: true,
    postgresql: {
      columnName: 'uuid',
      dataType: 'varchar',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  uuid: string;

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
  tagName: string;

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
  active: string;

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
  public: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Tag>) {
    super(data);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TagRelations {
  // describe navigational properties here
}

export type TagWithRelations = Tag & TagRelations;
