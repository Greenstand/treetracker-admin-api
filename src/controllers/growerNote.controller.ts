import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  post,
  param,
  get,
  patch,
  del,
  requestBody,
  HttpErrors,
  RestBindings,
  Response,
} from '@loopback/rest';
import { GrowerNote } from '../models';
import { GrowerNoteRepository, PlanterRepository } from '../repositories';

export class GrowerNoteController {
  constructor(
    @repository(GrowerNoteRepository)
    public growerNoteRepository: GrowerNoteRepository,
    @repository(PlanterRepository)
    public planterRepository: PlanterRepository,
  ) {}

  @get('/planter/{growerId}/notes', {
    responses: {
      '200': {
        description: 'Array of GrowerNote instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': GrowerNote } },
          },
        },
      },
      '404': { description: 'Planter not found' },
    },
  })
  async find(
    @param.path.number('growerId') growerId: number,
  ): Promise<GrowerNote[]> {
    await this.planterRepository.findById(growerId).catch(() => {
      throw new HttpErrors.NotFound(`Planter ${growerId} not found`);
    });
    return this.growerNoteRepository.find({ where: { planterId: growerId } });
  }

  @get('/organization/{organizationId}/planter/{growerId}/notes', {
    responses: {
      '200': {
        description: 'Array of GrowerNote instances for org-scoped planter',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': GrowerNote } },
          },
        },
      },
      '404': { description: 'Planter not found' },
    },
  })
  async findByOrg(
    @param.path.number('organizationId') _organizationId: number,
    @param.path.number('growerId') growerId: number,
  ): Promise<GrowerNote[]> {
    await this.planterRepository.findById(growerId).catch(() => {
      throw new HttpErrors.NotFound(`Planter ${growerId} not found`);
    });
    return this.growerNoteRepository.find({ where: { planterId: growerId } });
  }

  @post('/planter/{growerId}/notes', {
    responses: {
      '201': {
        description: 'GrowerNote created successfully',
        content: {
          'application/json': { schema: { 'x-ts-type': GrowerNote } },
        },
      },
      '404': { description: 'Planter not found' },
    },
  })
  async create(
    @param.path.number('growerId') growerId: number,
    @requestBody() note: GrowerNote,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<GrowerNote> {
    await this.planterRepository.findById(growerId).catch(() => {
      throw new HttpErrors.NotFound(`Planter ${growerId} not found`);
    });
    note.planterId = growerId;
    note.createdAt = new Date().toISOString();
    note.updatedAt = new Date().toISOString();
    const created = await this.growerNoteRepository.create(note);
    res.status(201);
    return created;
  }

  @patch('/planter/{growerId}/notes/{noteId}', {
    responses: {
      '200': {
        description: 'GrowerNote updated successfully',
        content: {
          'application/json': { schema: { 'x-ts-type': GrowerNote } },
        },
      },
      '403': { description: 'Note does not belong to this planter' },
      '404': { description: 'GrowerNote not found' },
    },
  })
  async updateById(
    @param.path.number('growerId') growerId: number,
    @param.path.number('noteId') noteId: number,
    @requestBody() note: Partial<GrowerNote>,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<GrowerNote> {
    const existing = await this.growerNoteRepository
      .findById(noteId)
      .catch(() => {
        throw new HttpErrors.NotFound(`GrowerNote ${noteId} not found`);
      });
    if (existing.planterId !== growerId) {
      throw new HttpErrors.Forbidden(
        `Note ${noteId} does not belong to planter ${growerId}`,
      );
    }
    note.updatedAt = new Date().toISOString();
    await this.growerNoteRepository.updateById(noteId, note);
    const updated = await this.growerNoteRepository.findById(noteId);
    res.status(200);
    return updated;
  }

  @del('/planter/{growerId}/notes/{noteId}', {
    responses: {
      '200': {
        description: 'GrowerNote deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      },
      '403': { description: 'Note does not belong to this planter' },
      '404': { description: 'GrowerNote not found' },
    },
  })
  async deleteById(
    @param.path.number('growerId') growerId: number,
    @param.path.number('noteId') noteId: number,
  ): Promise<{ message: string }> {
    const existing = await this.growerNoteRepository
      .findById(noteId)
      .catch(() => {
        throw new HttpErrors.NotFound(`GrowerNote ${noteId} not found`);
      });
    if (existing.planterId !== growerId) {
      throw new HttpErrors.Forbidden(
        `Note ${noteId} does not belong to planter ${growerId}`,
      );
    }
    await this.growerNoteRepository.deleteById(noteId);
    return { message: `Note ${noteId} deleted successfully` };
  }
}
