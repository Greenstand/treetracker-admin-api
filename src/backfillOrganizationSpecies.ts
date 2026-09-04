import { TreetrackerAdminApiApplication } from './application';
import {
  OrganizationRepository,
  TreesRepository,
  OrganizationSpeciesRepository,
} from './repositories';

export async function backfillOrganizationSpecies(
  args: string[],
): Promise<void> {
  const dryRun = args.includes('--dry-run');
  console.log(
    'Backfilling organization_species from historical tree usage (dry-run: %s)',
    dryRun,
  );

  const app = new TreetrackerAdminApiApplication();
  await app.boot();

  const organizationRepository = await app.getRepository(
    OrganizationRepository,
  );
  const treesRepository = await app.getRepository(TreesRepository);
  const organizationSpeciesRepository = await app.getRepository(
    OrganizationSpeciesRepository,
  );
  const organizations = await organizationRepository.find();
  console.log('Found %d organizations', organizations.length);
  const now = new Date();

  for (const organization of organizations) {
    const organizationId = organization.id as number;

    const organizationWhereClause =
      await treesRepository.getOrganizationWhereClause(organizationId);

    const trees = await treesRepository.find({
      where: {
        and: [organizationWhereClause, { speciesId: { neq: null } }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      fields: {
        speciesId: true,
      },
    });
    const usedSpeciesIds = [
      ...new Set(
        trees
          .map((tree) => tree.speciesId as number)
          .filter((speciesId) => speciesId != null),
      ),
    ];
    if (usedSpeciesIds.length === 0) {
      continue;
    }
    const existingMappings = await organizationSpeciesRepository.find({
      where: {
        organizationId,
      },
    });
    const alreadyMappedSpeciesIds = new Set(
      existingMappings.map((mapping) => mapping.speciesId),
    );
    const toInsert = usedSpeciesIds
      .filter((speciesId) => !alreadyMappedSpeciesIds.has(speciesId))
      .map((speciesId) => ({
        organizationId,
        speciesId,
        isActive: true,
        timeCreated: now,
        timeUpdated: now,
      }));
    if (toInsert.length === 0) {
      continue;
    }
    console.log(
      'Organization %d: %d species used historically, %d new mapping(s) to insert',
      organizationId,
      usedSpeciesIds.length,
      toInsert.length,
    );
    if (!dryRun) {
      await organizationSpeciesRepository.createAll(toInsert);
    }
  }
  process.exit(0);
}

backfillOrganizationSpecies(process.argv).catch((err) => {
  console.error(
    'Failed to backfill organization_species from historical tree usage',
    err,
  );
  process.exit(1);
});
