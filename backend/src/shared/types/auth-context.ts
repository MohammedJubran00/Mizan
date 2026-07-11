import type { WorkspaceRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  /** IANA timezone for the authenticated workspace. */
  workspaceTimezone: string;
}
