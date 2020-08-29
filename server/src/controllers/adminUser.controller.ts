import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { AdminUser } from '../models';
import { AdminUserRepository } from '../repositories';

export class AdminUserController {
  constructor(
    @repository(AdminUserRepository)
    public adminUserRepository: AdminUserRepository,
  ) {}

  // @get('/admin_user/count', {
  //   responses: {
  //     '200': {
  //       description: 'Admin user model count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async count(
  //   @param.query.object('where', getWhereSchemaFor(AdminUser)) where?: Where<AdminUser>,
  // ): Promise<Count> {
  //   return await this.adminUserRepository.count(where);
  // }

  // @get('/admin_user', {
  //   responses: {
  //     '200': {
  //       description: 'Array of Admin User model instances',
  //       content: {
  //         'application/json': {
  //           schema: {type: 'array', items: {'x-ts-type': AdminUser}},
  //         },
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.query.object('filter', getFilterSchemaFor(AdminUser)) filter?: Filter<AdminUser>,
  // ): Promise<AdminUser[]> {
  //   return await this.adminUserRepository.find(filter);
  // }

  // @get('/admin_user/{id}', {
  //   responses: {
  //     '200': {
  //       description: 'AdminUser model instance',
  //       content: {'application/json': {schema: {'x-ts-type': AdminUser}}},
  //     },
  //   },
  // })
  // async findById(@param.path.number('id') id: number): Promise<AdminUser> {
  //   return await this.adminUserRepository.findById(id);
  // }

  // @patch('/admin_user/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'AdminUser PATCH success',
  //     },
  //   },
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody() adminUser: AdminUser,
  // ): Promise<void> {
  //   await this.adminUserRepository.updateById(id, adminUser);
  // }

  // @del('/admin_user/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'AdminUser DELETE success',
  //     },
  //   },
  // })
  // async deleteById(
  //   @param.path.number('id') id: number,
  // ): Promise<void> {
  //   await this.adminUserRepository.deleteById(id);
  // }
}
