import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import {
  AuthToken,
  Credentials,
  RegisterPayload,
  User,
  UserRole,
} from '../../features/auth/data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // HttpClient et API_BASE seront ajoutés quand on implémentera les vraies API

  constructor() {}

  login(credentials: Credentials): Observable<{ user: User; token: AuthToken }> {
    // Mock pour l'instant - plus tard remplacer par http.post
    return this.mockLogin(credentials);
  }

  register(payload: RegisterPayload): Observable<{ user: User; token: AuthToken }> {
    // Mock pour l'instant - plus tard remplacer par http.post
    return this.mockRegister(payload);
  }

  me(): Observable<User> {
    // Mock pour l'instant - plus tard remplacer par http.get
    return this.mockMe();
  }

  refreshToken(refreshToken: string): Observable<AuthToken> {
    // Mock pour l'instant - plus tard remplacer par http.post
    return this.mockRefreshToken(refreshToken);
  }

  // Méthodes mock temporaires
  private mockLogin(credentials: Credentials): Observable<{ user: User; token: AuthToken }> {
    return new Observable(observer => {
      setTimeout(() => {
        if (credentials.email === 'admin@test.com' && credentials.password === 'admin') {
          const user: User = {
            id: '1',
            email: 'admin@test.com',
            displayName: 'Admin User',
            role: UserRole.ADMIN,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const token: AuthToken = {
            accessToken: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
            expiresIn: 3600,
            tokenType: 'Bearer',
          };

          observer.next({ user, token });
          observer.complete();
        } else if (credentials.email === 'user@test.com' && credentials.password === 'user') {
          const user: User = {
            id: '2',
            email: 'user@test.com',
            displayName: 'John Doe',
            role: UserRole.MEMBER,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const token: AuthToken = {
            accessToken: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
            expiresIn: 3600,
            tokenType: 'Bearer',
          };

          observer.next({ user, token });
          observer.complete();
        } else {
          observer.error({ message: 'Email ou mot de passe incorrect' });
        }
      }, 1000);
    });
  }

  private mockRegister(payload: RegisterPayload): Observable<{ user: User; token: AuthToken }> {
    return new Observable(observer => {
      setTimeout(() => {
        if (payload.email === 'existing@test.com') {
          observer.error({ message: 'Cet email est déjà utilisé' });
          return;
        }

        if (payload.password !== payload.confirmPassword) {
          observer.error({ message: 'Les mots de passe ne correspondent pas' });
          return;
        }

        const user: User = {
          id: 'new_user_' + Date.now(),
          email: payload.email,
          displayName: payload.displayName,
          role: UserRole.MEMBER,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const token: AuthToken = {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
          tokenType: 'Bearer',
        };

        observer.next({ user, token });
        observer.complete();
      }, 1500);
    });
  }

  private mockMe(): Observable<User> {
    // Simuler une vérification du token
    return of({
      id: '1',
      email: 'admin@test.com',
      displayName: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).pipe(delay(500));
  }

  private mockRefreshToken(refreshToken: string): Observable<AuthToken> {
    if (!refreshToken) {
      return throwError(() => new Error('Token de rafraîchissement invalide'));
    }

    return of({
      accessToken: 'new_mock_access_token_' + Date.now(),
      refreshToken: 'new_mock_refresh_token_' + Date.now(),
      expiresIn: 3600,
      tokenType: 'Bearer',
    }).pipe(delay(300));
  }
}