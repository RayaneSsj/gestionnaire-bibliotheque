export const enum UserRole {
  ADMIN = 'admin', // eslint-disable-line no-unused-vars
  LIBRARIAN = 'librarian', // eslint-disable-line no-unused-vars
  MEMBER = 'member', // eslint-disable-line no-unused-vars
}

// Export explicite pour ESLint
export const USER_ROLES = [UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.MEMBER];

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  confirmPassword: string;
}
