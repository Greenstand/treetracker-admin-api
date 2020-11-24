import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getFilterSchemaFor,
} from '@loopback/rest';
import {PlanterRegistration} from '../models';
import {PlanterRegistrationRepository} from '../repositories';

export class PlanterRegistrationController {
  constructor(
    @repository(PlanterRegistrationRepository)
    public planterRepository: PlanterRegistrationRepository,
  ) {}

  @get('/planter_registration', {
    responses: {
      '200': {
        description: 'Array of PlanterRegistration model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': PlanterRegistration}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(PlanterRegistration))
    filter?: Filter<PlanterRegistration>,
  ): Promise<PlanterRegistration[]> {
    return await this.planterRepository.find(filter);
  }

  @get('/planter_registration/{id}', {
    responses: {
      '200': {
        description: 'PlanterRegistration model instance',
        content: {'application/json': {schema: {'x-ts-type': PlanterRegistration}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<PlanterRegistration> {
    return await this.planterRepository.findById(id);
  }
}
