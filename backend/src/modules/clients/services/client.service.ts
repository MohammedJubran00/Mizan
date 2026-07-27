import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { CreateClientInput, ListClientsQuery, UpdateClientInput } from '../dto/client.dto';
import { mapClient } from '../mapper/client.mapper';
import type { ClientRepository } from '../repositories/client.repository';

export class ClientService {
  constructor(
    private readonly repository: ClientRepository,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  async list(auth: AuthContext, query: ListClientsQuery) {
    const { rows, total } = await this.repository.findMany(auth.workspaceId, query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      success: true,
      items: rows.map(mapClient),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasMore: query.page < totalPages },
    };
  }

  async getById(auth: AuthContext, id: string) {
    const row = await this.repository.findById(auth.workspaceId, id);
    if (!row) throw new AppError(404, 'Client not found.');
    return mapClient(row);
  }

  async create(auth: AuthContext, input: CreateClientInput) {
    const firstName = input.firstName ?? '';
    const lastName = input.lastName ?? '';
    const name = input.companyName?.trim() || `${firstName} ${lastName}`.trim();

    const row = await this.repository.create({
      workspaceId: auth.workspaceId,
      name,
      firstName,
      lastName,
      companyName: input.companyName,
      occupation: input.occupation,
      nationalId: input.nationalId,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      email: input.email,
      phone: input.phone,
      addressCountry: input.addressCountry,
      addressCity: input.addressCity,
      addressStreet: input.addressStreet,
      addressPostalCode: input.addressPostalCode,
      notes: input.notes,
      tags: input.tags,
    });

    await this.activityEngine?.recordClientAdded({ workspaceId: auth.workspaceId, actorId: auth.user.id, clientId: row.id, name: row.name });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CLIENT_ADDED');

    return mapClient(row);
  }

  async update(auth: AuthContext, id: string, input: UpdateClientInput) {
    const existing = await this.repository.findById(auth.workspaceId, id);
    if (!existing) throw new AppError(404, 'Client not found.');

    const firstName = input.firstName ?? existing.firstName ?? '';
    const lastName = input.lastName ?? existing.lastName ?? '';
    const companyName = input.companyName !== undefined ? input.companyName : existing.companyName;
    const name = companyName?.trim() || `${firstName} ${lastName}`.trim() || existing.name;

    const row = await this.repository.update(auth.workspaceId, id, {
      name,
      firstName,
      lastName,
      companyName,
      occupation: input.occupation !== undefined ? input.occupation : existing.occupation,
      nationalId: input.nationalId !== undefined ? input.nationalId : existing.nationalId,
      dateOfBirth: input.dateOfBirth !== undefined ? (input.dateOfBirth ? new Date(input.dateOfBirth) : null) : existing.dateOfBirth,
      email: input.email !== undefined ? input.email : existing.email,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      addressCountry: input.addressCountry !== undefined ? input.addressCountry : existing.addressCountry,
      addressCity: input.addressCity !== undefined ? input.addressCity : existing.addressCity,
      addressStreet: input.addressStreet !== undefined ? input.addressStreet : existing.addressStreet,
      addressPostalCode: input.addressPostalCode !== undefined ? input.addressPostalCode : existing.addressPostalCode,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      tags: input.tags !== undefined ? input.tags : existing.tags,
      status: input.status ?? existing.status,
      lastActivityAt: new Date(),
    });

    if (!row) throw new AppError(404, 'Client not found.');

    await this.activityEngine?.recordClientUpdated({ workspaceId: auth.workspaceId, actorId: auth.user.id, clientId: id, name: row.name });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CLIENT_UPDATED');

    return mapClient(row);
  }

  async delete(auth: AuthContext, id: string): Promise<void> {
    const deleted = await this.repository.delete(auth.workspaceId, id);
    if (!deleted) throw new AppError(404, 'Client not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CLIENT_UPDATED');
  }
}
