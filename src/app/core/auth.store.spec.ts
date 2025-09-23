import { TestBed } from '@angular/core/testing';

import { User, UserRole, AuthToken } from '../features/auth/data';

import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: AuthStore;
  let mockUser: User;
  let mockToken: AuthToken;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);

    localStorage.clear();

    mockUser = {
      id: '1',
      email: 'admin@test.com',
      displayName: 'Admin Test',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    mockToken = {
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have null currentUser initially', () => {
      expect(store.currentUser()).toBeNull();
    });

    it('should have null authToken initially', () => {
      expect(store.authToken()).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(store.isAuthenticated()).toBeFalse();
    });

    it('should not be admin initially', () => {
      expect(store.isAdmin()).toBeFalse();
    });

    it('should have empty displayName initially', () => {
      expect(store.displayName()).toBe('');
    });
  });

  describe('loginSuccess', () => {
    it('should set currentUser and authToken', () => {
      store.loginSuccess(mockUser, mockToken);

      expect(store.currentUser()).toEqual(mockUser);
      expect(store.authToken()).toEqual(mockToken);
    });

    it('should set isAuthenticated to true after login', () => {
      store.loginSuccess(mockUser, mockToken);

      expect(store.isAuthenticated()).toBeTrue();
    });

    it('should set isAdmin to true for admin user', () => {
      store.loginSuccess(mockUser, mockToken);

      expect(store.isAdmin()).toBeTrue();
    });

    it('should set isAdmin to false for non-admin user', () => {
      const memberUser = { ...mockUser, role: UserRole.MEMBER };
      store.loginSuccess(memberUser, mockToken);

      expect(store.isAdmin()).toBeFalse();
    });

    it('should set correct displayName', () => {
      store.loginSuccess(mockUser, mockToken);

      expect(store.displayName()).toBe('Admin Test');
    });

    it('should persist to localStorage', (done) => {
      store.loginSuccess(mockUser, mockToken);

      // Wait for effect to run
      setTimeout(() => {
        const stored = localStorage.getItem('auth_state');
        expect(stored).toBeTruthy();

        const parsedState = JSON.parse(stored!);
        expect(parsedState.user).toEqual(mockUser);
        expect(parsedState.token).toEqual(mockToken);
        expect(parsedState.timestamp).toBeInstanceOf(Number);
        done();
      }, 0);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      store.loginSuccess(mockUser, mockToken);
    });

    it('should set currentUser to null', () => {
      store.logout();

      expect(store.currentUser()).toBeNull();
    });

    it('should set authToken to null', () => {
      store.logout();

      expect(store.authToken()).toBeNull();
    });

    it('should set isAuthenticated to false', () => {
      store.logout();

      expect(store.isAuthenticated()).toBeFalse();
    });

    it('should set isAdmin to false', () => {
      store.logout();

      expect(store.isAdmin()).toBeFalse();
    });

    it('should set displayName to empty string', () => {
      store.logout();

      expect(store.displayName()).toBe('');
    });

    it('should remove from localStorage', (done) => {
      store.logout();

      // Wait for effect to run
      setTimeout(() => {
        const stored = localStorage.getItem('auth_state');
        expect(stored).toBeNull();
        done();
      }, 0);
    });
  });

  describe('isAdmin computed', () => {
    it('should return true for ADMIN role', () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      store.loginSuccess(adminUser, mockToken);

      expect(store.isAdmin()).toBeTrue();
    });

    it('should return false for MEMBER role', () => {
      const memberUser = { ...mockUser, role: UserRole.MEMBER };
      store.loginSuccess(memberUser, mockToken);

      expect(store.isAdmin()).toBeFalse();
    });

    it('should return false for LIBRARIAN role', () => {
      const librarianUser = { ...mockUser, role: UserRole.LIBRARIAN };
      store.loginSuccess(librarianUser, mockToken);

      expect(store.isAdmin()).toBeFalse();
    });

    it('should return false when no user', () => {
      expect(store.isAdmin()).toBeFalse();
    });
  });

  describe('isAuthenticated computed', () => {
    it('should return true when both user and token exist', () => {
      store.loginSuccess(mockUser, mockToken);

      expect(store.isAuthenticated()).toBeTrue();
    });

    it('should return false when user exists but token is null', () => {
      store.loginSuccess(mockUser, mockToken);
      store['_authToken'].set(null);

      expect(store.isAuthenticated()).toBeFalse();
    });

    it('should return false when token exists but user is null', () => {
      store.loginSuccess(mockUser, mockToken);
      store['_currentUser'].set(null);

      expect(store.isAuthenticated()).toBeFalse();
    });

    it('should return false when both user and token are null', () => {
      expect(store.isAuthenticated()).toBeFalse();
    });
  });
});