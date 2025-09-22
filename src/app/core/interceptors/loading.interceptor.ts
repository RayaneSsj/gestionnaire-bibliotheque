import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  if (shouldIgnoreRequest(req.url)) {
    return next(req);
  }

  loadingService.incrementRequests();

  return next(req).pipe(
    finalize(() => {
      loadingService.decrementRequests();
    })
  );
};

function shouldIgnoreRequest(url: string): boolean {
  const ignoredPatterns = [
    '/assets/',
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ];

  return ignoredPatterns.some(pattern => url.includes(pattern));
}