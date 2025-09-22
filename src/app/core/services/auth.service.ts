import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AuthToken,
  Credentials,
  RegisterPayload,
  User,
} from '../../features/auth/data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: Credentials): Observable<{ user: User; token: AuthToken }> {
    return this.http.post<{ user: User; token: AuthToken }>('/api/auth/login', credentials);
  }

  register(payload: RegisterPayload): Observable<{ user: User; token: AuthToken }> {
    return this.http.post<{ user: User; token: AuthToken }>('/api/auth/register', payload);
  }

  me(): Observable<User> {
    return this.http.get<User>('/api/auth/me');
  }

  refreshToken(refreshToken: string): Observable<AuthToken> {
    return this.http.post<AuthToken>('/api/auth/refresh', { refreshToken });
  }
}