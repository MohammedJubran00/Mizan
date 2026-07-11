import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../../../config/env';
import { AppError } from '../../../shared/errors/AppError';
import type { LoginDto } from '../dto/login.dto';
import type { RegisterDto } from '../dto/register.dto';
import type { UserRepository } from '../repositories/user.repository';
import type { WorkspaceRepository } from '../repositories/workspace.repository';
import type { SafeUser } from '../repositories/user.repository.interface';
import {
  buildDefaultWorkspaceName,
  buildWorkspaceSlug,
} from '../utils/workspace-naming';

const BCRYPT_ROUNDS = 12;

export interface RegisterResult {
  success: true;
  message: string;
}

export interface LoginResult {
  success: true;
  accessToken: string;
  user: SafeUser;
  workspace: {
    id: string;
    name: string;
    role: string;
  };
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new AppError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
    });

    await this.workspaceRepository.createWithOwner({
      name: buildDefaultWorkspaceName(dto.fullName),
      slug: buildWorkspaceSlug(dto.fullName, user.id),
      ownerUserId: user.id,
    });

    return {
      success: true,
      message: 'Account created successfully.',
    };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new AppError(401, 'Invalid email or password.');
    }

    let membership = await this.workspaceRepository.findPrimaryMembership(user.id);

    // Backward-compatible: accounts created before workspaces get a default tenant.
    if (!membership) {
      membership = await this.workspaceRepository.createWithOwner({
        name: buildDefaultWorkspaceName(user.fullName),
        slug: buildWorkspaceSlug(user.fullName, user.id),
        ownerUserId: user.id,
      });
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        workspaceId: membership.workspaceId,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] },
    );

    return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      workspace: {
        id: membership.workspaceId,
        name: membership.workspaceName,
        role: membership.role,
      },
    };
  }
}
