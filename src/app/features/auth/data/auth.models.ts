export enum UserRole {
  ADMIN = 'admin',
  LIBRARIAN = 'librarian', 
  MEMBER = 'member',
}

// Export explicite pour ESLint
export const USER_ROLES = Object.values(UserRole);

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