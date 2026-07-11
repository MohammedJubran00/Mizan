import type { PrismaClient } from '@prisma/client';

import type {
  CreateUserData,
  UserEntity,
} from './user.repository.interface';

export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    return this.db.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  }
}
