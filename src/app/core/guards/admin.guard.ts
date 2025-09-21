import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../auth.store';

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthenticated = authStore.isAuthenticated();
  const isAdmin = authStore.isAdmin();

  if (!isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!isAdmin) {
    router.navigate(['/']);
    return false;
  }

  return true;
};