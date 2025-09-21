import { Routes } from '@angular/router';

import { adminGuard, authGuard } from './core';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/catalog',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'catalog',
    loadChildren: () =>
      import('./features/catalog/catalog.routes').then(m => m.catalogRoutes),
  },
  {
    path: 'loans',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/loans/loans.routes').then(m => m.loansRoutes),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/ui/not-found.page').then(c => c.NotFoundPage),
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
