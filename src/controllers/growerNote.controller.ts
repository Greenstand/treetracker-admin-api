import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  Request,
  requestBody,
  RequestBodyObject,
  Response,
  RestBindings,
} from '@loopback/rest';
import { GrowerNote } from '../models';
import { GrowerNoteRepository, PlanterRepository } from '../repositories';

interface StaffSession {
  id: number;
  firstName?: string;
  lastName?: string;
  userName?: string;
}

interface NoteInput {
  content: string;
}

const noteBody: RequestBodyObject = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, pattern: '\\S' },
        },
      },
    },
  },
};

const noteResponse = {
  description: 'Grower note',
  content: { 'application/json': { schema: getModelSchemaRef(GrowerNote) } },
};
const listResponse = {
  description: 'Grower notes, newest first',
  content: {
    'application/json': {
      schema: { type: 'array', items: getModelSchemaRef(GrowerNote) },
    },
  },
};

export class GrowerNoteController {
  constructor(
    @repository(GrowerNoteRepository)
    public noteRepository: GrowerNoteRepository,
    @repository(PlanterRepository)
    public planterRepository: PlanterRepository,
    @inject(RestBindings.Http.REQUEST)
    private request: Request & { user?: StaffSession },
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
  ) {}

  @get('/organization/{organizationId}/planter/{growerId}/notes', {
    responses: { '200': listResponse },
  })
  async find(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('growerId') growerId: number,
  ): Promise<GrowerNote[]> {
    await this.validateGrowerOrganization(organizationId, growerId);
    return this.noteRepository.find({
      where: { planterId: growerId },
      order: ['createdAt DESC', 'id DESC'],
    });
  }

  @post('/organization/{organizationId}/planter/{growerId}/notes', {
    responses: { '201': noteResponse },
  })
  async create(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('growerId') growerId: number,
    @requestBody(noteBody) input: NoteInput,
  ): Promise<GrowerNote> {
    await this.validateGrowerOrganization(organizationId, growerId);
    const user = this.request.user;
    if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) {
      throw new HttpErrors.Unauthorized('A staff login is required');
    }
    const now = new Date();
    const authorName =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.userName;
    if (!authorName) {
      throw new HttpErrors.UnprocessableEntity('Staff display name is missing');
    }
    const note = await this.noteRepository.create({
      planterId: growerId,
      content: this.content(input),
      authorId: user.id,
      authorName,
      createdAt: now,
      updatedAt: now,
    });
    this.response.status(201);
    return note;
  }

  @patch('/organization/{organizationId}/planter/{growerId}/notes/{noteId}', {
    responses: { '204': { description: 'Grower note updated' } },
  })
  async updateById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('growerId') growerId: number,
    @param.path.number('noteId') noteId: number,
    @requestBody(noteBody) input: NoteInput,
  ): Promise<void> {
    this.validateId(noteId);
    await this.validateGrowerOrganization(organizationId, growerId);
    const result = await this.noteRepository.updateAll(
      { content: this.content(input), updatedAt: new Date() },
      { id: noteId, planterId: growerId },
    );
    if (!result.count) {
      throw new HttpErrors.NotFound('Grower note not found');
    }
  }

  @del('/organization/{organizationId}/planter/{growerId}/notes/{noteId}', {
    responses: { '204': { description: 'Grower note deleted' } },
  })
  async deleteById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('growerId') growerId: number,
    @param.path.number('noteId') noteId: number,
  ): Promise<void> {
    this.validateId(noteId);
    await this.validateGrowerOrganization(organizationId, growerId);
    const result = await this.noteRepository.deleteAll({
      id: noteId,
      planterId: growerId,
    });
    if (!result.count) {
      throw new HttpErrors.NotFound('Grower note not found');
    }
  }

  private validateId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new HttpErrors.BadRequest('IDs must be positive integers');
    }
  }

  private async validateGrowerOrganization(
    organizationId: number,
    growerId: number,
  ): Promise<void> {
    this.validateId(organizationId);
    this.validateId(growerId);
    const grower = await this.planterRepository.findById(growerId);
    const entityIds = await this.planterRepository.getEntityIdsByOrganizationId(
      organizationId,
    );
    if (!entityIds.includes(Number(grower.organizationId))) {
      throw new HttpErrors.Forbidden(
        'Grower does not belong to this organization',
      );
    }
  }

  private content(input: NoteInput): string {
    if (typeof input?.content !== 'string' || !input.content.trim()) {
      throw new HttpErrors.UnprocessableEntity('Note content cannot be empty');
    }
    return input.content.trim();
  }
}
