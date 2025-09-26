import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, AuthStore } from '../../../core';
import { UserRole } from '../data';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ou
            <a
              routerLink="/auth/register"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              créez un nouveau compte
            </a>
          </p>
        </div>

        <form
          class="mt-8 space-y-6"
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
        >
          <div class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
                placeholder="votre@email.com"
              />
              <div
                *ngIf="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <div *ngIf="loginForm.get('email')?.errors?.['required']">
                  L'email est requis
                </div>
                <div *ngIf="loginForm.get('email')?.errors?.['email']">
                  L'email n'est pas valide
                </div>
              </div>
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
                placeholder="Votre mot de passe"
              />
              <div
                *ngIf="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <div *ngIf="loginForm.get('password')?.errors?.['required']">
                  Le mot de passe est requis
                </div>
              </div>
            </div>
          </div>

          <div
            *ngIf="errorMessage()"
            class="bg-red-50 border border-red-200 rounded-md p-4"
          >
            <div class="text-sm text-red-600">
              {{ errorMessage() }}
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                *ngIf="isLoading()"
                class="absolute left-0 inset-y-0 flex items-center pl-3"
              >
                <svg
                  class="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ isLoading() ? 'Connexion...' : 'Se connecter' }}
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">Comptes de test :</p>
            <p class="text-xs text-gray-500 mt-1">
              Admin: admin&#64;test.com / admin<br />
              Utilisateur: user&#64;test.com / user
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials = this.loginForm.value as {
      email: string;
      password: string;
    };

    this.authService.login(credentials).subscribe({
      next: ({ user, token }) => {
        this.authStore.loginSuccess(user, token);

        // Redirection basée sur le rôle
        if (user.role === UserRole.ADMIN) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/catalog']);
        }
      },
      error: error => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || error.message || 'Une erreur est survenue'
        );
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
