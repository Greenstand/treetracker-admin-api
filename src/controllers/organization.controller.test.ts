import { validateValueAgainstSchema } from '@loopback/rest';

import { ORGANIZATION_REQUEST_SCHEMA } from '../dto/organization-dto';
import { OrganizationController } from './organization.controller';

describe('OrganizationController', () => {
  const validateOrganization = (value: object) =>
    validateValueAgainstSchema(
      value,
      ORGANIZATION_REQUEST_SCHEMA,
      {},
      { source: 'body', ajvErrors: {} },
    );

  it('delegates organization creation to the repository', async () => {
    const createOrganization = jest.fn().mockResolvedValue({
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
    const controller = new OrganizationController({
      createOrganization,
    } as never);

    const result = await controller.create({
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });

    expect(createOrganization).toHaveBeenCalledWith({
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });
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

  describe('request schema', () => {
    it('accepts valid organization payloads', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '+232 123 4567',
          website: 'https://fcc.example.com',
          logoUrl: '',
          mapName: 'freetown',
        }),
      ).resolves.toMatchObject({
        name: 'FCC',
        phone: '+232 123 4567',
        website: 'https://fcc.example.com',
      });
    });

    it('accepts blank optional fields', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '',
          website: '',
          logoUrl: '',
          mapName: '',
        }),
      ).resolves.toMatchObject({
        name: 'FCC',
        phone: '',
        website: '',
        logoUrl: '',
        mapName: '',
      });
    });

    it('rejects missing required fields', async () => {
      await expect(
        validateOrganization({
          phone: '+232 123 4567',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({ message: 'Name is required' }),
          expect.objectContaining({ message: 'Email is required' }),
        ]),
      });
    });

    it('rejects firstName and lastName fields', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          firstName: 'checking',
          lastName: 'person',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Only supported organization fields are allowed',
          }),
        ]),
      });
    });

    it('rejects unsupported fields', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          extra: 'nope',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Only supported organization fields are allowed',
          }),
        ]),
      });
    });

    it('rejects invalid website values', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          website: 'not-a-url',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Website must be empty or a valid URL',
          }),
        ]),
      });
    });

    it('rejects phone numbers with fewer than 10 digits with one clear error', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '0311350',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [
          expect.objectContaining({
            path: '/phone',
            code: 'errorMessage',
            message: 'Phone must be empty or a valid phone number',
          }),
        ],
      });
    });

    it('rejects phone numbers with invalid characters', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '12345abcde',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Phone must be empty or a valid phone number',
          }),
        ]),
      });
    });
  });
});
