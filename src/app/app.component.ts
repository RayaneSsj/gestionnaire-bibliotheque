import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { AuthStore } from './core';
import { SpinnerComponent } from './shared/ui/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="container">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-semibold">
            <a
              routerLink="/"
              class="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Gestionnaire Bibliothèque
            </a>
          </h1>
          <nav class="hidden md:flex space-x-8 items-center">
            <a routerLink="/catalog" routerLinkActive="active" class="nav-link"
              >Catalogue</a
            >
            @if (showEmprunts()) {
              <a routerLink="/loans" routerLinkActive="active" class="nav-link"
                >Emprunts</a
              >
            }
            @if (showAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-link"
                >Admin</a
              >
            }
            @if (showAuth()) {
              <a routerLink="/auth" routerLinkActive="active" class="nav-link"
                >Connexion</a
              >
            }
            @if (showUserInfo()) {
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">
                  Bonjour, {{ currentUserName() }}
                </span>
                <button
                  (click)="onLogout()"
                  class="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            }
          </nav>
          <button class="md:hidden p-2 rounded-md hover:bg-gray-100">
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
    <main class="min-h-screen bg-gray-50">
      <router-outlet></router-outlet>
    </main>
    <app-spinner></app-spinner>
  `,
  styles: [
    `
      .nav-link {
        @apply text-gray-600 hover:text-gray-900 transition-colors;
      }
      .nav-link.active {
        @apply text-blue-600 font-medium;
      }
    `
  ],
})
export class AppComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    console.log('🚀 AppComponent loaded!');
    console.log('AuthStore:', this.authStore);
    console.log('Initial isAuthenticated:', this.authStore.isAuthenticated());
    console.log('Initial currentUser:', this.authStore.currentUser());
  }

  // Computed signals pour la navigation dynamique
  readonly showEmprunts = computed(() => {
    const isAuth = this.authStore.isAuthenticated();
    console.log('🟢 showEmprunts - isAuthenticated:', isAuth);
    return isAuth;
  });

  readonly showAdmin = computed(() => {
    const isAdmin = this.authStore.isAdmin();
    console.log('🟡 showAdmin - isAdmin:', isAdmin);
    return isAdmin;
  });

  readonly showAuth = computed(() => {
    const isAuth = this.authStore.isAuthenticated();
    console.log('🔵 showAuth - !isAuthenticated:', !isAuth);
    return !isAuth;
  });

  readonly showUserInfo = computed(() => {
    const isAuth = this.authStore.isAuthenticated();
    console.log('🟣 showUserInfo - isAuthenticated:', isAuth);
    return isAuth;
  });

  readonly currentUserName = computed(() => {
    const user = this.authStore.currentUser();
    console.log('🟠 currentUserName - user:', user);
    return user ? user.displayName : '';
  });

  onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/']);
  }
}
