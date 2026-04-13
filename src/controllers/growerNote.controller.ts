import { repository } from '@loopback/repository';
import { post, param, get, patch, del, requestBody } from '@loopback/rest';
import { GrowerNote } from '../models';
import { GrowerNoteRepository } from '../repositories';

export class GrowerNoteController {
  constructor(
    @repository(GrowerNoteRepository)
    public growerNoteRepository: GrowerNoteRepository,
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
    },
  })
  async find(
    @param.path.number('growerId') growerId: number,
  ): Promise<GrowerNote[]> {
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
    },
  })
  async findByOrg(
    @param.path.number('organizationId') _organizationId: number,
    @param.path.number('growerId') growerId: number,
  ): Promise<GrowerNote[]> {
    return this.growerNoteRepository.find({ where: { planterId: growerId } });
  }

  @post('/planter/{growerId}/notes', {
    responses: {
      '200': {
        description: 'GrowerNote create success',
        content: {
          'application/json': { schema: { 'x-ts-type': GrowerNote } },
        },
      },
    },
  })
  async create(
    @param.path.number('growerId') growerId: number,
    @requestBody() note: GrowerNote,
  ): Promise<GrowerNote> {
    note.planterId = growerId;
    note.createdAt = new Date().toISOString();
    note.updatedAt = new Date().toISOString();
    return this.growerNoteRepository.create(note);
  }

  @patch('/planter/{growerId}/notes/{noteId}', {
    responses: {
      '204': {
        description: 'GrowerNote PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('growerId') _growerId: number,
    @param.path.number('noteId') noteId: number,
    @requestBody() note: Partial<GrowerNote>,
  ): Promise<void> {
    note.updatedAt = new Date().toISOString();
    await this.growerNoteRepository.updateById(noteId, note);
  }

  @del('/planter/{growerId}/notes/{noteId}', {
    responses: {
      '204': {
        description: 'GrowerNote delete success',
      },
    },
  })
  async deleteById(
    @param.path.number('growerId') _growerId: number,
    @param.path.number('noteId') noteId: number,
  ): Promise<void> {
    await this.growerNoteRepository.deleteById(noteId);
  }
}
