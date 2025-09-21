import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/auth.page').then(c => c.AuthPage),
  },
];
