import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/no-empty-interface */

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'admin_user'},
  },
})
export class AdminUser extends Entity {
  @property({
    type: Number,
    required: true,
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
    required: true,
    length: 30,
    postgresql: {
      columnName: 'user_name',
      dataType: 'character varying',
      dataLength: 150,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  username: String;

  @property({
    type: String,
    required: true,
    length: 30,
    postgresql: {
      columnName: 'password_hash',
      dataType: 'character varying',
      dataLength: 150,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  hasswordHash: String;

  @property({
    type: String,
    required: false,
    postgresql: {
      columnName: 'email',
      dataType: 'character varying',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  email?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AdminUser>) {
    super(data);
  }
}

export interface AdminUserRelations {
  // describe navigational properties here
}

export type AdminUserWithRelations = AdminUser & AdminUserRelations;
