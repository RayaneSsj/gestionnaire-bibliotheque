import { Routes } from '@angular/router';

import { adminGuard } from '../../core';

export const catalogRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/catalog.page').then(c => c.CatalogPage),
  },
  {
    path: 'new',
    canActivate: [adminGuard],
    loadComponent: () => import('./ui/book-new.page').then(c => c.BookNewPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./ui/book-detail.page').then(c => c.BookDetailPage),
  },
  {
    path: ':id/edit',
    canActivate: [adminGuard],
    loadComponent: () => import('./ui/book-edit.page').then(c => c.BookEditPage),
  },
];
