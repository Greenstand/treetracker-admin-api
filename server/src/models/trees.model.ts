import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, postgresql: {schema: 'public', table: 'trees'}}})
export class Trees extends Entity {
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
    postgresql: {"columnName":"time_created","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  timeCreated: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"time_updated","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  timeUpdated: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {"columnName":"missing","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  missing?: Boolean;

  @property({
    type: Boolean,
    required: false,
    postgresql: {"columnName":"priority","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  priority?: Boolean;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"cause_of_death_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  causeOfDeathId?: Number;

	//Sun Dec  8 16:09:12 CST 2019
	//change from user_id to planter_id 
  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"planter_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  planterId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"primary_location_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  primaryLocationId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"settings_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  settingsId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"override_settings_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  overrideSettingsId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"dead","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  dead: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"photo_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  photoId?: Number;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"image_url","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  imageUrl?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"certificate_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  certificateId?: Number;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"estimated_geometric_location","dataType":"USER-DEFINED","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  estimatedGeometricLocation?: String;

  @property({
    type: Number,
    required: false,
    postgresql: {"columnName":"lat","dataType":"numeric","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  lat?: Number;

  @property({
    type: Number,
    required: false,
    postgresql: {"columnName":"lon","dataType":"numeric","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  lon?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"gps_accuracy","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  gpsAccuracy?: Number;

  @property({
    type: Boolean,
    required: false,
    postgresql: {"columnName":"active","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  active?: Boolean;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"planter_photo_url","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  planterPhotoUrl?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"planter_identifier","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  planterIdentifier?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"device_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  deviceId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"sequence","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  sequence?: Number;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"note","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  note?: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {"columnName":"verified","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  verified: Boolean;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"uuid","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  uuid?: String;

  @property({
    type: Boolean,
    required: false,
    postgresql: {"columnName":"approved","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  approved: Boolean;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"status","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  status?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"morphology","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  morphology?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"age","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  age?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"species_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  speciesId?: Number;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"capture_approval_tag","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  captureApprovalTag?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"rejection_reason","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  rejectionReason?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"planting_organization_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  plantingOrganizationId?: Number;


  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Trees>) {
    super(data);
  }
}

export interface TreesRelations {
  // describe navigational properties here
}

export type TreesWithRelations = Trees & TreesRelations;
