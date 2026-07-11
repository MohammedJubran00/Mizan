export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<UserEntity, 'passwordHash'>;

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash: string;
}
