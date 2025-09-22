import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthStore } from '../auth.store';

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue s\'est produite';
      let shouldLogout = false;

      console.error('Erreur HTTP interceptée:', {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
        error: error.error,
      });

      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
          break;

        case 400:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = 'Requête invalide. Vérifiez les données saisies.';
          }
          break;

        case 401:
          errorMessage = error.error?.message || 'Session expirée. Veuillez vous reconnecter.';
          shouldLogout = true;
          break;

        case 403:
          errorMessage = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
          break;

        case 404:
          if (req.url.includes('/api/')) {
            errorMessage = error.error?.message || 'Ressource non trouvée.';
          } else {
            errorMessage = 'Page non trouvée.';
          }
          break;

        case 409:
          errorMessage = error.error?.message || 'Conflit détecté. Cette action ne peut pas être effectuée.';
          break;

        case 422:
          errorMessage = error.error?.message || 'Données invalides. Vérifiez votre saisie.';
          break;

        case 429:
          errorMessage = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
          break;

        case 500:
          errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
          break;

        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
          break;

        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
      }

      if (shouldLogout && authStore.isAuthenticated()) {
        console.warn('Déconnexion automatique due à une erreur d\'authentification');
        authStore.logout();
        router.navigate(['/auth/login']);
      }

      const apiError: ApiError = {
        message: errorMessage,
        code: error.status.toString(),
        details: error.error,
      };

      const errorConfig: any = {
        error: apiError,
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
      };
      
      if (error.url) {
        errorConfig.url = error.url;
      }

      const enhancedError = new HttpErrorResponse(errorConfig);

      return throwError(() => enhancedError);
    })
  );
};