const capturesData = [
  {
    id: 1,
    reference_id: 1,
    image_url: 'http://dummyimage.com/190x100.png/dddddd/000000',
    lat: 3.352913,
    lon: 97.913223,
    gps_accuracy: 18,
    device_identifier: '52dbd82e-08fa-4d50-a009-a0cd4d4f0e21',
    planter_username: 'lmatias0',
    planter_id: 1,
    planter_photo_url: 'http://testurl.com/user_photo',
    attributes: 'Crimson',
    status: false,
    note: 'Consuming Kids: The Commercialization of Childhood',
    morphology: 'Mazama americana',
    age: 1,
    created_at: '1/6/2021',
    updated_at: '6/21/2021',
  },
  {
    id: 2,
    reference_id: 2,
    image_url: 'http://dummyimage.com/115x100.png/dddddd/000000',
    lat: 22.2016816,
    lon: -97.8367954,
    gps_accuracy: 40,
    device_identifier: 'bcedf250-a8fd-45ab-a9f7-1a21ad679527',
    planter_username: 'cliddiard1',
    planter_id: 2,
    planter_photo_url: 'http://testurl.com/user_photo',
    attributes: 'Teal',
    status: false,
    note: 'Body Shots',
    morphology: 'Sylvicapra grimma',
    age: 2,
    created_at: '4/27/2021',
    updated_at: '2/1/2021',
  },
  {
    id: 3,
    reference_id: 3,
    image_url: 'http://dummyimage.com/193x100.png/dddddd/000000',
    lat: 49.7863419,
    lon: 21.9461429,
    gps_accuracy: 20,
    device_identifier: 'f861996a-7fa9-4522-adfa-2836f617cc1e',
    planter_username: 'phollyer2',
    planter_id: 3,
    planter_photo_url: 'http://dummyimage.com/158x100.png/5fa2dd/ffffff',
    attributes: 'Teal',
    status: false,
    note: 'Every Other Weekend (Un week-end sur deux)',
    morphology: 'Spilogale gracilis',
    age: 3,
    created_at: '9/5/2021',
    updated_at: '2/3/2021',
  },
  {
    id: 4,
    reference_id: 4,
    image_url: 'http://dummyimage.com/208x100.png/dddddd/000000',
    lat: 31.829323,
    lon: 119.977286,
    gps_accuracy: 39,
    device_identifier: '4afccc27-0575-4fd4-b7d4-97698008d502',
    planter_username: 'rbowbrick3',
    planter_id: 4,
    planter_photo_url: 'http://dummyimage.com/140x100.png/cc0000/ffffff',
    attributes: 'Teal',
    status: true,
    note: 'Misconception',
    morphology: 'Semnopithecus entellus',
    age: 4,
    created_at: '10/15/2021',
    updated_at: '2/15/2021',
  },
  {
    id: 5,
    reference_id: 5,
    image_url: 'http://dummyimage.com/153x100.png/ff4444/ffffff',
    lat: 43.5592985,
    lon: 25.9323591,
    gps_accuracy: 51,
    device_identifier: '141d49c8-2628-4d28-9160-58cc54a32725',
    planter_username: 'dhalfhide4',
    planter_id: 5,
    planter_photo_url: 'http://dummyimage.com/140x100.png/cc0000/ffffff',
    attributes: 'Crimson',
    status: false,
    note: 'Seance on a Wet Afternoon',
    morphology: 'Certotrichas paena',
    age: 5,
    created_at: '11/25/2020',
    updated_at: '9/19/2021',
  },
  {
    id: 6,
    reference_id: 6,
    image_url: 'http://dummyimage.com/127x100.png/5fa2dd/ffffff',
    lat: 39.95,
    lon: -75.16,
    gps_accuracy: 56,
    device_identifier: '6ffbd7cc-b898-4227-a35c-ab14c9fcf035',
    planter_username: 'wriccardini5',
    planter_id: 6,
    planter_photo_url: 'http://dummyimage.com/137x100.png/5fa2dd/ffffff',
    attributes: 'Aquamarine',
    status: true,
    note: 'Emotion',
    morphology: 'Phoenicopterus ruber',
    age: 6,
    created_at: '7/15/2021',
    updated_at: '5/11/2021',
  },
  {
    id: 7,
    reference_id: 7,
    image_url: 'http://dummyimage.com/217x100.png/ff4444/ffffff',
    lat: 55.4602073,
    lon: 50.1454514,
    gps_accuracy: 86,
    device_identifier: 'd5ca37e0-d21f-4903-875d-5001c4a74683',
    planter_username: 'kswane6',
    planter_id: 7,
    planter_photo_url: 'http://dummyimage.com/248x100.png/dddddd/000000',
    attributes: 'Mauv',
    status: true,
    note: 'Enter the Dragon',
    morphology: 'Anathana ellioti',
    age: 7,
    created_at: '10/8/2021',
    updated_at: '11/8/2020',
  },
  {
    id: 8,
    reference_id: 8,
    image_url: 'http://dummyimage.com/204x100.png/ff4444/ffffff',
    lat: -7.356466,
    lon: 108.207518,
    gps_accuracy: 35,
    device_identifier: '56f434cc-a936-4729-a36e-b912dcf23dcf',
    planter_username: 'ldighton7',
    planter_id: 8,
    planter_photo_url: 'http://dummyimage.com/184x100.png/5fa2dd/ffffff',
    attributes: 'Mauv',
    status: true,
    note: 'The Inspector',
    morphology: 'Phasianus colchicus',
    age: 8,
    created_at: '2/16/2021',
    updated_at: '2/3/2021',
  },
  {
    id: 9,
    reference_id: 9,
    image_url: 'http://dummyimage.com/100x100.png/5fa2dd/ffffff',
    lat: 45.597839,
    lon: 126.637515,
    gps_accuracy: 96,
    device_identifier: '0473ad18-ea8c-415f-b383-08b3ecbe58d6',
    planter_username: 'asinisbury8',
    planter_id: 9,
    planter_photo_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
    attributes: 'Maroon',
    status: false,
    note: 'Butterfly on a Wheel (Shattered)',
    morphology: 'Naja haje',
    age: 9,
    created_at: '3/3/2021',
    updated_at: '8/11/2021',
  },
  {
    id: 10,
    reference_id: 10,
    image_url: 'http://dummyimage.com/178x100.png/cc0000/ffffff',
    lat: -6.0802849,
    lon: 106.3110622,
    gps_accuracy: 96,
    device_identifier: '577204b9-2f4c-44fc-a610-efaba599440f',
    planter_username: 'fdowngate9',
    planter_id: 10,
    planter_photo_url: 'http://dummyimage.com/193x100.png/5fa2dd/ffffff',
    attributes: 'Crimson',
    status: false,
    note: "All Tomorrow's Parties",
    morphology: 'Marmota monax',
    age: 10,
    created_at: '5/18/2021',
    updated_at: '11/11/2020',
  },
  {
    id: 11,
    reference_id: 11,
    image_url: 'http://dummyimage.com/172x100.png/ff4444/ffffff',
    lat: -6.2382699,
    lon: 106.9755726,
    gps_accuracy: 38,
    device_identifier: 'd70234da-f7ab-4f83-87e0-c3e2c7cbb7e1',
    planter_username: 'gklimentyeva',
    planter_id: 11,
    planter_photo_url: 'http://dummyimage.com/124x100.png/5fa2dd/ffffff',
    attributes: 'Mauv',
    status: false,
    note: "Dr. Terror's House of Horrors",
    morphology: 'Recurvirostra avosetta',
    age: 11,
    created_at: '3/17/2021',
    updated_at: '12/16/2020',
  },
  {
    id: 12,
    reference_id: 12,
    image_url: 'http://dummyimage.com/209x100.png/ff4444/ffffff',
    lat: 35.1274285,
    lon: -80.8599193,
    gps_accuracy: 29,
    device_identifier: 'b410a7a7-4ec2-4ad4-ad28-7c8ba0c02c48',
    planter_username: 'mgueb',
    planter_id: 12,
    planter_photo_url: 'http://dummyimage.com/203x100.png/cc0000/ffffff',
    attributes: 'Red',
    status: false,
    note: 'In the Good Old Summertime',
    morphology: 'Dusicyon thous',
    age: 12,
    created_at: '1/23/2021',
    updated_at: '6/30/2021',
  },
  {
    id: 13,
    reference_id: 13,
    image_url: 'http://dummyimage.com/224x100.png/ff4444/ffffff',
    lat: 14.5672317,
    lon: 121.0298199,
    gps_accuracy: 23,
    device_identifier: '178bc58a-2f8e-4da2-bfe2-935ac94de749',
    planter_username: 'etschirschkyc',
    planter_id: 13,
    planter_photo_url: 'http://dummyimage.com/244x100.png/ff4444/ffffff',
    attributes: 'Blue',
    status: false,
    note: 'Audition (Ôdishon)',
    morphology: 'Phalaropus lobatus',
    age: 13,
    created_at: '7/23/2021',
    updated_at: '10/7/2021',
  },
  {
    id: 14,
    reference_id: 14,
    image_url: 'http://dummyimage.com/138x100.png/dddddd/000000',
    lat: 15.8800584,
    lon: 108.3380469,
    gps_accuracy: 80,
    device_identifier: '7d71ea2c-5c1f-4ba4-80f8-ea18b92283df',
    planter_username: 'jdelacoted',
    planter_id: 14,
    planter_photo_url: 'http://dummyimage.com/156x100.png/dddddd/000000',
    attributes: 'Maroon',
    status: true,
    note: 'Love Sick Love',
    morphology: 'Antilope cervicapra',
    age: 14,
    created_at: '5/9/2021',
    updated_at: '3/6/2021',
  },
  {
    id: 15,
    reference_id: 15,
    image_url: 'http://dummyimage.com/232x100.png/dddddd/000000',
    lat: 14.7668705,
    lon: -91.1779176,
    gps_accuracy: 82,
    device_identifier: '115b7c25-5495-4b1c-a2c0-fa6bb361cab1',
    planter_username: 'kmartensene',
    planter_id: 15,
    planter_photo_url: 'http://dummyimage.com/146x100.png/cc0000/ffffff',
    attributes: 'Aquamarine',
    status: false,
    note: 'Forbidden Games (Jeux interdits)',
    morphology: 'Choriotis kori',
    age: 15,
    created_at: '12/26/2020',
    updated_at: '9/5/2021',
  },
];

const candidatesData = [
  {
    tree_id: 1,
    captures: [
      {
        id: 'c02a5ae6-3727-11ec-8d3d-0242ac130003',
        reference_id: '1',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '0',
        lon: '0',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'x',
        planter_photo_url: null,
        attributes: null,
        status: 'approved',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-05-04T11:24:43.000Z',
        updated_at: '2021-05-04T11:24:43.000Z',
      },
      {
        id: '232a5f41-ea18-4cbf-8580-be799d799c8f',
        reference_id: '111',
        image_url: 'http://dummyimage.com/158x100.png/5fa2dd/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: 0,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: '',
        note: '',
        morphology: '',
        age: 0,
        created_at: '2021-04-04T02:30:35.390Z',
        updated_at: '2021-04-04T02:30:35.390Z',
      },
      {
        id: 'c4b92268-a370-4080-9fef-ca9ca431e314',
        reference_id: '111',
        image_url: 'http://dummyimage.com/100x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: 0,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: '',
        note: '',
        morphology: '',
        age: 0,
        created_at: '2021-04-04T02:21:46.135Z',
        updated_at: '2021-04-04T02:21:46.135Z',
      },
      {
        id: 'e6c426bc-517a-4497-9c71-cb2303bd621e',
        reference_id: '111',
        image_url: 'http://dummyimage.com/115x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: 0,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: '',
        note: '',
        morphology: '',
        age: 0,
        created_at: '2021-04-04T02:13:38.521Z',
        updated_at: '2021-04-04T02:13:38.521Z',
      },
      {
        id: '8e9fadfc-d160-4ed1-9ff5-65f03bd3ae4b',
        reference_id: '108',
        image_url: 'http://dummyimage.com/208x100.png/dddddd/000000',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser1',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: { entries: ['yellow', 'native'] },
        status: 'approved',
        note: '',
        morphology: null,
        age: null,
        created_at: '2021-04-03T20:21:48.120Z',
        updated_at: '2021-04-03T20:21:48.120Z',
      },
      {
        id: 'dfddf80e-fcab-41a6-a325-e5a761167068',
        reference_id: '107',
        image_url: 'http://dummyimage.com/153x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: { entries: ['yellow', 'native'] },
        status: 'approved',
        note: '',
        morphology: null,
        age: null,
        created_at: '2021-04-03T20:06:55.927Z',
        updated_at: '2021-04-03T20:06:55.927Z',
      },
      {
        id: 'a7cc5cbb-3009-4a94-b975-15faa20e41ee',
        reference_id: '106',
        image_url: 'http://dummyimage.com/127x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: { entries: ['yellow', 'native'] },
        status: 'approved',
        note: '',
        morphology: null,
        age: null,
        created_at: '2021-04-03T20:04:06.355Z',
        updated_at: '2021-04-03T20:04:06.355Z',
      },
      {
        id: 'd7234494-6bb2-4be8-9eaf-1df03c0d25a5',
        reference_id: '109',
        image_url: 'http://dummyimage.com/192x134.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser2',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: { entries: ['yellow', 'native'] },
        status: 'approved',
        note: '',
        morphology: null,
        age: null,
        created_at: '2021-03-29T00:30:33.362Z',
        updated_at: '2021-03-29T00:30:33.362Z',
      },
      {
        id: '2a8ba198-739e-4ab1-b8cd-5bd25d78127a',
        reference_id: '105',
        image_url: 'http://dummyimage.com/100x145.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'testUser2',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: 'rejected',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-03-29T00:04:40.000Z',
        updated_at: '2021-03-29T00:04:40.332Z',
      },
      {
        id: '2f69b241-f4f5-4b13-a35c-72bc4b5ea192',
        reference_id: '110',
        image_url: 'http://dummyimage.com/192x189.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: 'approved',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-03-27T00:23:25.541Z',
        updated_at: '2021-03-27T00:23:25.541Z',
      },
    ],
  },
  {
    tree_id: 2,
    captures: [
      {
        id: '684a3632-2864-4a85-99a2-3d0ac685725b',
        reference_id: '104',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'testUser1',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: 'rejected',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-03-26T23:16:27.270Z',
        updated_at: '2021-03-26T23:16:27.270Z',
      },
      {
        id: 'dddf59ce-8660-4292-8f8e-e4dc859cd0ed',
        reference_id: '103',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: 'rejected',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-03-26T23:00:36.269Z',
        updated_at: '2021-03-26T23:00:36.269Z',
      },
      {
        id: '42fb76ac-0267-491f-92fb-cb8371e41422',
        reference_id: '101',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'testUser2',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: 'rejected',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-03-26T22:36:37.626Z',
        updated_at: '2021-03-26T22:36:37.626Z',
      },
      {
        id: '8f415a50-84f4-4544-bcc5-c1f79ce71e28',
        reference_id: '102',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'testUser1',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: 'approved',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-03-26T18:03:31.356Z',
        updated_at: '2021-03-26T18:03:31.356Z',
      },
    ],
  },
  {
    tree_id: 3,
    captures: [
      {
        id: 'c02a5ae6-3727-11ec-8d3d-0242ac130003',
        reference_id: '1',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '0',
        lon: '0',
        gps_accuracy: null,
        device_identifier: null,
        planter_id: '1',
        planter_username: 'x',
        planter_photo_url: null,
        attributes: null,
        status: 'approved',
        note: null,
        morphology: null,
        age: null,
        created_at: '2021-05-04T11:24:43.000Z',
        updated_at: '2021-05-04T11:24:43.000Z',
      },
      {
        id: '232a5f41-ea18-4cbf-8580-be799d799c8f',
        reference_id: '111',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: 0,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: '',
        note: '',
        morphology: '',
        age: 0,
        created_at: '2021-04-04T02:30:35.390Z',
        updated_at: '2021-04-04T02:30:35.390Z',
      },
      {
        id: 'c4b92268-a370-4080-9fef-ca9ca431e314',
        reference_id: '111',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: 0,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: '',
        note: '',
        morphology: '',
        age: 0,
        created_at: '2021-04-04T02:21:46.135Z',
        updated_at: '2021-04-04T02:21:46.135Z',
      },
      {
        id: 'e6c426bc-517a-4497-9c71-cb2303bd621e',
        reference_id: '111',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: 0,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser3',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: null,
        status: '',
        note: '',
        morphology: '',
        age: 0,
        created_at: '2021-04-04T02:13:38.521Z',
        updated_at: '2021-04-04T02:13:38.521Z',
      },
      {
        id: '8e9fadfc-d160-4ed1-9ff5-65f03bd3ae4b',
        reference_id: '108',
        image_url: 'http://dummyimage.com/192x100.png/ff4444/ffffff',
        lat: '38.2919',
        lon: '122.458',
        gps_accuracy: null,
        device_identifier: '',
        planter_id: '1',
        planter_username: 'testUser1',
        planter_photo_url: 'http://testurl.com/user_photo',
        attributes: { entries: ['yellow', 'native'] },
        status: 'approved',
        note: '',
        morphology: null,
        age: null,
        created_at: '2021-04-03T20:21:48.120Z',
        updated_at: '2021-04-03T20:21:48.120Z',
      },
    ],
  },
];

module.exports = { capturesData, candidatesData };
