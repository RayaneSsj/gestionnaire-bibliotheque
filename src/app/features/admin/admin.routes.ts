import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/admin.page').then(c => c.AdminPage),
  },
];
