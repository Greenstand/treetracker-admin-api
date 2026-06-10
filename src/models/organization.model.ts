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
    postgresql: { columnName: 'first_name', dataType: 'character varying' },
  })
  firstName: String;

  @property({
    type: String,
    postgresql: { columnName: 'last_name', dataType: 'character varying' },
  })
  lastName: String;

  @property({
    type: String,
    postgresql: { columnName: 'email', dataType: 'character varying' },
  })
  email: String;

  @property({
    type: String,
    postgresql: { columnName: 'phone', dataType: 'character varying' },
  })
  phone: String;

  @property({
    type: Boolean,
    postgresql: { columnName: 'pwd_reset_required', dataType: 'boolean' },
  })
  pwdResetRequired: Boolean;

  @property({
    type: String,
    postgresql: { columnName: 'website', dataType: 'character varying' },
  })
  website: String;

  @property({
    type: String,
    postgresql: { columnName: 'wallet', dataType: 'character varying' },
  })
  wallet: String;

  @property({
    type: Number,
    postgresql: { columnName: 'active_contract_id', dataType: 'integer' },
  })
  activeContractId: Number;

  @property({
    type: Boolean,
    postgresql: { columnName: 'offering_pay_to_plant', dataType: 'boolean' },
  })
  offeringPayToPlant: Boolean;

  @property({
    type: Number,
    postgresql: {
      columnName: 'tree_validation_contract_id',
      dataType: 'integer',
    },
  })
  treeValidationContractId: Number;

  @property({
    type: String,
    postgresql: { columnName: 'logo_url', dataType: 'character varying' },
  })
  logoUrl: String;

  @property({
    type: String,
    postgresql: { columnName: 'map_name', dataType: 'character varying' },
  })
  mapName: String;

  // NOTE: the `password` and `salt` columns are intentionally NOT mapped here
  // so they are never serialized over the API.

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
