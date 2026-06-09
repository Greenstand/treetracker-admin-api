import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'public', table: 'domain_event' },
  },
})
export class DomainEvent extends Entity {
  @property({
    type: String,
    required: true,
    id: true,
    postgresql: {
      columnName: 'id',
      dataType: 'uuid',
      nullable: 'NO',
    },
  })
  id: string;

  @property({
    type: 'object',
    required: true,
    postgresql: {
      columnName: 'payload',
      dataType: 'jsonb',
      nullable: 'NO',
    },
  })
  payload: object;

  @property({
    type: String,
    required: true,
    postgresql: {
      columnName: 'status',
      dataType: 'varchar',
      nullable: 'NO',
    },
  })
  status: string;

  @property({
    type: String,
    required: true,
    postgresql: {
      columnName: 'created_at',
      dataType: 'timestamptz',
      nullable: 'NO',
    },
  })
  createdAt: string;

  @property({
    type: String,
    required: true,
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamptz',
      nullable: 'NO',
    },
  })
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DomainEventRelations {
  // describe navigational properties here
}

export type DomainEventWithRelations = DomainEvent & DomainEventRelations;
