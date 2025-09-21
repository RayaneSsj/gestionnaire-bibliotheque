import { Injectable, computed, effect, signal } from '@angular/core';

import { AuthToken, User, UserRole } from '../features/auth/data';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly STORAGE_KEY = 'auth_state';

  // Signals
  private readonly _currentUser = signal<User | null>(null);
  private readonly _authToken = signal<AuthToken | null>(null);

  // Exposer les signals en lecture seule
  readonly currentUser = this._currentUser.asReadonly();
  readonly authToken = this._authToken.asReadonly();

  // Computed
  readonly isAuthenticated = computed(() => {
    const user = this._currentUser();
    const token = this._authToken();
    return !!(user && token);
  });

  readonly isAdmin = computed(() => {
    const user = this._currentUser();
    return user?.role === UserRole.ADMIN;
  });

  readonly isLibrarian = computed(() => {
    const user = this._currentUser();
    return user?.role === UserRole.LIBRARIAN;
  });

  readonly displayName = computed(() => {
    const user = this._currentUser();
    return user?.displayName || '';
  });

  constructor() {
    // Rehydratation depuis localStorage
    this.rehydrateFromStorage();

    // Effect pour persister dans localStorage
    effect(() => {
      const user = this._currentUser();
      const token = this._authToken();

      const state = {
        user,
        token,
        timestamp: Date.now(),
      };

      if (user && token) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  // Méthodes
  loginSuccess(user: User, token: AuthToken): void {
    this._currentUser.set(user);
    this._authToken.set(token);
  }

  logout(): void {
    this._currentUser.set(null);
    this._authToken.set(null);
  }

  private rehydrateFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return;
      }

      const state = JSON.parse(stored);
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      // Vérifier que les données ne sont pas trop anciennes
      if (state.timestamp && now - state.timestamp > oneWeek) {
        localStorage.removeItem(this.STORAGE_KEY);
        return;
      }

      if (state.user && state.token) {
        this._currentUser.set(state.user);
        this._authToken.set(state.token);
      }
    } catch (error) {
      console.error('Erreur lors de la rehydratation:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}