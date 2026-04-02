import { OrganizationRepository } from './organization.repository';

describe('OrganizationRepository', () => {
  it('creates an organization row with normalized payload values', async () => {
    const execute = jest.fn().mockResolvedValue([
      {
        id: 178,
        type: 'o',
        name: 'FCC',
        email: 'fcc@example.com',
        phone: '+232 123 4567',
        pwd_reset_required: false,
        website: 'https://fcc.example.com',
        logo_url: 'https://fcc.example.com/logo.png',
        map_name: 'freetown',
      },
    ]);
    const repository = Object.create(
      OrganizationRepository.prototype,
    ) as OrganizationRepository & {
      execute: jest.Mock;
    };
    repository.execute = execute;

    const result = await repository.createOrganization({
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });

    expect(execute).toHaveBeenCalledWith(
      'insert into entity (type, name, email, phone, pwd_reset_required, website, logo_url, map_name) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *',
      [
        'o',
        'FCC',
        'fcc@example.com',
        '+232 123 4567',
        false,
        'https://fcc.example.com',
        'https://fcc.example.com/logo.png',
        'freetown',
      ],
    );
    expect(result).toMatchObject({
      id: 178,
      type: 'o',
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      pwdResetRequired: false,
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });
  });
});
