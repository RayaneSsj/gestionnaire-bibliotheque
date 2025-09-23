import { CommonModule } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, AuthStore } from '../../../core';
import { matchPassword, passwordStrength } from '../../../shared/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ou
            <a routerLink="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
              connectez-vous à votre compte existant
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="displayName" class="block text-sm font-medium text-gray-700">
                Nom d'affichage
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                formControlName="displayName"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched"
                placeholder="Votre nom d'affichage"
              />
              <div *ngIf="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched" 
                   class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('displayName')?.errors?.['required']">
                  Le nom d'affichage est requis
                </div>
                <div *ngIf="registerForm.get('displayName')?.errors?.['minlength']">
                  Le nom d'affichage doit contenir au moins 2 caractères
                </div>
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                placeholder="votre@email.com"
              />
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                   class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('email')?.errors?.['required']">
                  L'email est requis
                </div>
                <div *ngIf="registerForm.get('email')?.errors?.['email']">
                  L'email n'est pas valide
                </div>
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                placeholder="Votre mot de passe"
              />
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                   class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('password')?.errors?.['required']">
                  Le mot de passe est requis
                </div>
                <div *ngIf="registerForm.get('password')?.errors?.['passwordStrength']">
                  <div *ngFor="let error of getPasswordErrors(); trackBy: trackByError" class="text-xs">
                    • {{ error }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                placeholder="Confirmez votre mot de passe"
              />
              <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" 
                   class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                  La confirmation du mot de passe est requise
                </div>
                <div *ngIf="registerForm.get('confirmPassword')?.errors?.['matchPassword']">
                  {{ registerForm.get('confirmPassword')?.errors?.['matchPassword'] }}
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="text-sm text-red-600">
              {{ errorMessage() }}
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading() ? 'Création du compte...' : 'Créer le compte' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly registerForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrength()]],
    confirmPassword: ['', [Validators.required, matchPassword('password')]],
  });

  getPasswordErrors(): string[] {
    const passwordErrors = this.registerForm.get('password')?.errors?.['passwordStrength'];
    if (!passwordErrors) {return [];}

    return Object.values(passwordErrors) as string[];
  }

  trackByError(_index: number, error: string): string {
    return error;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { displayName, email, password, confirmPassword } = this.registerForm.value as {
      displayName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };

    this.authService.register({ displayName, email, password, confirmPassword }).subscribe({
      next: ({ user, token }) => {
        this.authStore.loginSuccess(user, token);
        this.router.navigate(['/catalog']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Une erreur est survenue');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}