import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./ui/login.page').then(c => c.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./ui/register.page').then(c => c.RegisterPage),
  },
];
