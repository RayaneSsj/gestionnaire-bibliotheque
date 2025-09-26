import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from '../auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.authToken();

  console.log('Auth interceptor - URL:', req.url, 'Token:', !!token);

  if (token && req.url.startsWith('/api/')) {
    console.log(
      'Adding auth header with token:',
      token.accessToken.substring(0, 20) + '...'
    );
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token.accessToken}`),
    });
    return next(authReq);
  }

  return next(req);
};
