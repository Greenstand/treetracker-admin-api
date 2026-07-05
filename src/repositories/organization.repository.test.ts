import { OrganizationRepository } from './organization.repository';

function buildRepository(execute: jest.Mock) {
  const repository = Object.create(
    OrganizationRepository.prototype,
  ) as OrganizationRepository & {
    execute: jest.Mock;
  };
  repository.execute = execute;
  return repository;
}

function buildUpdatableRepository(mocks: {
  updateAll: jest.Mock;
  findById: jest.Mock;
}) {
  const repository = Object.create(
    OrganizationRepository.prototype,
  ) as OrganizationRepository & {
    updateAll: jest.Mock;
    findById: jest.Mock;
  };
  repository.updateAll = mocks.updateAll;
  repository.findById = mocks.findById;
  return repository;
}

describe('OrganizationRepository', () => {
  it('creates an organization row with normalized payload values', async () => {
    const execute = jest.fn().mockResolvedValue([
      {
        id: 178,
        type: 'O',
        name: 'FCC',
        email: 'fcc@example.com',
        phone: '+232 123 4567',
        pwd_reset_required: false,
        website: 'https://fcc.example.com',
        logo_url: 'https://fcc.example.com/logo.png',
        map_name: 'freetown',
      },
    ]);
    const repository = buildRepository(execute);

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
        'O',
        'FCC',
        'fcc@example.com',
        '+232 123 4567',
        false,
        'https://fcc.example.com',
        'https://fcc.example.com/logo.png',
        'freetown',
      ],
      undefined,
    );
    expect(result).toMatchObject({
      id: 178,
      type: 'O',
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      pwdResetRequired: false,
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });
  });

  it('updates only the provided fields with normalized values, scoped to orgs', async () => {
    const updatedRow = {
      id: 178,
      type: 'O',
      name: 'FCC Renamed',
      email: 'fcc@example.com',
      logoUrl: 'https://fcc.example.com/new-logo.png',
    };
    const updateAll = jest.fn().mockResolvedValue({ count: 1 });
    const findById = jest.fn().mockResolvedValue(updatedRow);
    const repository = buildUpdatableRepository({ updateAll, findById });

    const result = await repository.updateOrganization(178, {
      name: '  FCC Renamed  ',
      logoUrl: 'https://fcc.example.com/new-logo.png',
    });

    expect(updateAll).toHaveBeenCalledWith(
      { name: 'FCC Renamed', logoUrl: 'https://fcc.example.com/new-logo.png' },
      { id: 178, type: 'O' },
      undefined,
    );
    expect(findById).toHaveBeenCalledWith(178, undefined, undefined);
    // updateOrganization returns convertCamel(...), a new object — compare by
    // value, not reference.
    expect(result).toEqual(updatedRow);
  });

  it('stores blank optional fields as null', async () => {
    const updateAll = jest.fn().mockResolvedValue({ count: 1 });
    const findById = jest.fn().mockResolvedValue({ id: 178 });
    const repository = buildUpdatableRepository({ updateAll, findById });

    await repository.updateOrganization(178, {
      phone: '',
      website: '   ',
    });

    expect(updateAll).toHaveBeenCalledWith(
      { phone: null, website: null },
      { id: 178, type: 'O' },
      undefined,
    );
  });

  it('returns null without fetching when no organization row matches', async () => {
    const updateAll = jest.fn().mockResolvedValue({ count: 0 });
    const findById = jest.fn();
    const repository = buildUpdatableRepository({ updateAll, findById });

    const result = await repository.updateOrganization(999, {
      name: 'Missing Org',
    });

    expect(result).toBeNull();
    expect(findById).not.toHaveBeenCalled();
  });

  it('throws without writing when there are no fields to update', async () => {
    const updateAll = jest.fn();
    const findById = jest.fn();
    const repository = buildUpdatableRepository({ updateAll, findById });

    await expect(
      repository.updateOrganization(178, { name: undefined }),
    ).rejects.toThrow('No organization fields to update');

    expect(updateAll).not.toHaveBeenCalled();
  });
});
