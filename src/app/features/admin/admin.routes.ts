import { Routes } from '@angular/router';

import { adminGuard } from '../../core';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/admin-dashboard.page').then(c => c.AdminDashboardPage),
    canActivate: [adminGuard],
  },
  {
    path: 'members',
    loadComponent: () => import('./ui/members.page').then(c => c.MembersPage),
    canActivate: [adminGuard],
  },
];
