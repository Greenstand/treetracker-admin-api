import { Request } from '@loopback/rest';

import { SpeciesController } from './species.controller';
import { SpeciesRepository, TreesRepository } from '../repositories';
import { Species } from '../models';
import { Role } from '../types/roles';

const SPECIES = [
  { id: 1, name: 'flower' },
  { id: 2, name: 'maple' },
] as Species[];

const COUNTS = [{ species_id: 1, count: '7' }];

function controllerFor(roles: string[] | undefined) {
  const speciesRepository = {
    find: jest.fn().mockResolvedValue(SPECIES),
  } as unknown as SpeciesRepository;
  const treesRepository = {
    execute: jest.fn().mockResolvedValue(COUNTS),
  } as unknown as TreesRepository;
  const request = (
    roles
      ? { user: { policy: { policies: roles.map((name) => ({ name })) } } }
      : {}
  ) as Request;

  return {
    controller: new SpeciesController(
      speciesRepository,
      treesRepository,
      request,
    ),
    treesRepository,
  };
}

describe('SpeciesController.find', () => {
  it.each([Role.SUPER_PERMISSION, Role.ADMIN, Role.LIST_TREE])(
    'merges the capture count for %s',
    async (role) => {
      const { controller } = controllerFor([role]);

      expect(await controller.find()).toEqual([
        { id: 1, name: 'flower', captureCount: 7 },
        { id: 2, name: 'maple', captureCount: 0 },
      ]);
    },
  );

  it('omits the count for a role that cannot open the page', async () => {
    const { controller, treesRepository } = controllerFor(['planter']);

    expect(await controller.find()).toEqual(SPECIES);
    expect(treesRepository.execute).not.toHaveBeenCalled();
  });

  it('omits the count for an unauthenticated request', async () => {
    const { controller } = controllerFor(undefined);

    expect(await controller.find()).toEqual(SPECIES);
  });
});
