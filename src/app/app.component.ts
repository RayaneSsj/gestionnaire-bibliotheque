import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';

import { AuthStore } from './core';
import { SpinnerComponent } from './shared/ui/spinner.component';
import { ToastComponent } from './shared/ui/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SpinnerComponent,
    ToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Skip link for accessibility -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:underline"
    >
      Aller au contenu principal
    </a>

    <header class="bg-white shadow-sm border-b sticky top-0 z-50" role="banner">
      <div class="container">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-semibold">
            <a
              routerLink="/"
              class="text-blue-600 hover:text-blue-700 transition-colors"
              aria-label="Retour à l'accueil - Gestionnaire Bibliothèque"
            >
              Gestionnaire Bibliothèque
            </a>
          </h1>
          <nav
            class="hidden md:flex space-x-8 items-center"
            role="navigation"
            aria-label="Navigation principale"
          >
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
                >Administration</a
              >
            }
            @if (showAuth()) {
              <a routerLink="/auth" routerLinkActive="active" class="nav-link"
                >Connexion</a
              >
            }
            @if (showUserInfo()) {
              <div class="flex items-center space-x-4">
                <span
                  class="text-sm text-gray-600"
                  aria-label="Utilisateur connecté"
                >
                  Bonjour, {{ currentUserName() }}
                </span>
                <button
                  (click)="onLogout()"
                  class="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  aria-label="Se déconnecter de l'application"
                >
                  Déconnexion
                </button>
              </div>
            }
          </nav>
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            [attr.aria-label]="
              isMobileMenuOpen()
                ? 'Fermer le menu de navigation'
                : 'Ouvrir le menu de navigation'
            "
            [attr.aria-expanded]="isMobileMenuOpen()"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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

      <!-- Menu mobile déroulant -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden border-t bg-white shadow-lg">
          <div class="container py-4 space-y-4">
            <a
              routerLink="/catalog"
              routerLinkActive="active"
              class="block nav-link text-lg py-2"
              (click)="closeMobileMenu()"
            >
              Catalogue
            </a>
            @if (showEmprunts()) {
              <a
                routerLink="/loans"
                routerLinkActive="active"
                class="block nav-link text-lg py-2"
                (click)="closeMobileMenu()"
              >
                Emprunts
              </a>
            }
            @if (showAdmin()) {
              <a
                routerLink="/admin"
                routerLinkActive="active"
                class="block nav-link text-lg py-2"
                (click)="closeMobileMenu()"
              >
                Administration
              </a>
            }
            @if (showAuth()) {
              <a
                routerLink="/auth"
                routerLinkActive="active"
                class="block nav-link text-lg py-2"
                (click)="closeMobileMenu()"
              >
                Connexion
              </a>
            }
            @if (showUserInfo()) {
              <div class="border-t pt-4 space-y-4">
                <div class="text-sm text-gray-600">
                  Bonjour, {{ currentUserName() }}
                </div>
                <button
                  (click)="onLogout(); closeMobileMenu()"
                  class="block w-full text-left bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            }
          </div>
        </div>
      }
    </header>
    <main id="main-content" class="min-h-screen bg-gray-50" role="main">
      <router-outlet></router-outlet>
    </main>
    <app-spinner></app-spinner>
    <app-toast></app-toast>
  `,
  styles: [
    `
      .nav-link {
        @apply text-gray-600 hover:text-gray-900 transition-colors;
      }
      .nav-link.active {
        @apply text-blue-600 font-medium;
      }
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #1e40af;
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
        border-radius: 4px;
      }
      .skip-link:focus {
        top: 6px;
      }
    `,
  ],
})
export class AppComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  // Signal pour gérer l'état du menu mobile
  readonly isMobileMenuOpen = signal(false);

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

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
