import { Routes } from '@angular/router';

import { adminGuard } from '../../core';

export const loansRoutes: Routes = [
  {
    path: '',
    redirectTo: 'mine',
    pathMatch: 'full',
  },
  {
    path: 'mine',
    loadComponent: () => import('./ui/my-loans.page').then(c => c.MyLoansPage),
  },
  {
    path: 'all',
    loadComponent: () =>
      import('./ui/all-loans.page').then(c => c.AllLoansPage),
    canActivate: [adminGuard],
  },
  {
    path: 'new',
    loadComponent: () => import('./ui/loan-new.page').then(c => c.LoanNewPage),
    canActivate: [adminGuard],
  },
];
