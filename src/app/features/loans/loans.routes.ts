import { Routes } from '@angular/router';

export const loansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/loans.page').then(c => c.LoansPage),
  },
];
