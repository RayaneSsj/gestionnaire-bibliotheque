import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthenticated = authStore.isAuthenticated();

  if (!isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};