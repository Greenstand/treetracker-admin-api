import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: true,
    postgresql: { schema: 'public', table: 'grower_note' },
  },
})
export class GrowerNote extends Entity {
  @property({ type: 'number', id: true, generated: true })
  id: number;

  @property({
    type: 'number',
    required: true,
    postgresql: { columnName: 'planter_id', dataType: 'integer' },
  })
  planterId: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: { minLength: 1, pattern: '\\S' },
    postgresql: { dataType: 'text' },
  })
  content: string;

  @property({
    type: 'number',
    required: true,
    postgresql: { columnName: 'author_id', dataType: 'integer' },
  })
  authorId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'author_name', dataType: 'varchar' },
  })
  authorName: string;

  @property({
    type: 'date',
    required: true,
    postgresql: { columnName: 'created_at', dataType: 'timestamptz' },
  })
  createdAt: Date;

  @property({
    type: 'date',
    required: true,
    postgresql: { columnName: 'updated_at', dataType: 'timestamptz' },
  })
  updatedAt: Date;

  constructor(data?: Partial<GrowerNote>) {
    super(data);
  }
}
