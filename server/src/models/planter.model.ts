import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, postgresql: {schema: 'public', table: 'planter'}}})
export class Planter extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: {"columnName":"id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  id: Number;

  @property({
    type: String,
    required: true,
    length: 30,
    postgresql: {"columnName":"first_name","dataType":"character varying","dataLength":30,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  firstName: String;

  @property({
    type: String,
    required: true,
    length: 30,
    postgresql: {"columnName":"last_name","dataType":"character varying","dataLength":30,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  lastName: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"email","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  email?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"organization","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  organization?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"phone","dataType":"text","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  phone?: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {"columnName":"pwd_reset_required","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  pwdResetRequired?: Boolean;

  // @property({
  //   type: String,
  //   required: false,
  //   postgresql: {"columnName":"salt","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  // })
  // salt?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"image_url","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  imageUrl?: String;

  //added person_id  
  //Sat May 23 09:56:55 CST 2020
  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"person_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  personId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"organization_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  organizationId?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Planter>) {
    super(data);
  }
}

export interface PlanterRelations {
  // describe navigational properties here
}

export type PlanterWithRelations = Planter & PlanterRelations;
