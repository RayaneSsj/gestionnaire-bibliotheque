import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
          <nav class="hidden md:flex space-x-8">
            <a routerLink="/catalog" routerLinkActive="active" class="nav-link"
              >Catalogue</a
            >
            <a routerLink="/loans" routerLinkActive="active" class="nav-link"
              >Emprunts</a
            >
            <a routerLink="/admin" routerLinkActive="active" class="nav-link"
              >Admin</a
            >
            <a routerLink="/auth" routerLinkActive="active" class="nav-link"
              >Connexion</a
            >
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
  styles: [],
})
export class AppComponent {}
