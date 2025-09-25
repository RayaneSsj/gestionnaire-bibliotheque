import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthStore, FocusManagementService } from '../../../core';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { LoansStore } from '../../loans/loans.store';
import { CatalogStore } from '../catalog.store';

import { BookCardComponent } from './book-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent, HasRoleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-900" id="page-title">
            Catalogue des livres
          </h1>
          <!-- Utilisation de la directive hasRole -->
          <button
            *appHasRole="'admin'"
            type="button"
            (click)="onAddBook()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            aria-label="Ajouter un nouveau livre au catalogue"
          >
            + Ajouter un livre
          </button>
        </div>

        <!-- Statistiques -->
        <section
          class="bg-blue-50 rounded-lg p-4 mb-6"
          aria-labelledby="stats-title"
        >
          <h2 id="stats-title" class="sr-only">Statistiques du catalogue</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">
                {{ catalogStore.totalBooks() }}
              </div>
              <div class="text-sm text-gray-600">Livres au total</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">
                {{ catalogStore.totalAvailableBooks() }}
              </div>
              <div class="text-sm text-gray-600">Livres disponibles</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">
                {{ catalogStore.filteredBooks().length }}
              </div>
              <div class="text-sm text-gray-600">Résultats affichés</div>
            </div>
          </div>
        </section>
      </div>

      <!-- Filtres et recherche -->
      <section
        class="bg-white rounded-lg shadow-sm border p-6 mb-8"
        aria-labelledby="filters-title"
      >
        <h2 id="filters-title" class="sr-only">Filtres et recherche</h2>
        <form role="search" aria-label="Rechercher et filtrer les livres">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Recherche -->
            <div class="md:col-span-2">
              <label
                for="search"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Recherche
              </label>
              <div class="relative">
                <input
                  id="search"
                  name="search"
                  type="text"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                  placeholder="Rechercher par titre ou auteur..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="search-help"
                />
                <div id="search-help" class="sr-only">
                  Saisissez un titre de livre ou un nom d'auteur pour filtrer
                  les résultats
                </div>
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Filtre par catégorie -->
            <div>
              <label
                for="category"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                [ngModel]="selectedCategoryId()"
                (ngModelChange)="onCategoryChange($event)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-describedby="category-help"
              >
                <option value="">Toutes les catégories</option>
                <option
                  *ngFor="
                    let category of catalogStore.categories();
                    trackBy: trackByCategoryId
                  "
                  [value]="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <div id="category-help" class="sr-only">
                Sélectionnez une catégorie pour filtrer les livres
              </div>
            </div>
          </div>

          <!-- Actions de filtrage -->
          <div class="flex justify-between items-center mt-4 pt-4 border-t">
            <button
              *ngIf="hasActiveFilters()"
              type="button"
              (click)="onClearFilters()"
              class="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Effacer tous les filtres actifs"
            >
              Effacer tous les filtres
            </button>
          </div>
        </form>
      </section>

      <!-- Grille des livres -->
      <section
        *ngIf="catalogStore.filteredBooks().length > 0"
        aria-labelledby="books-grid-title"
      >
        <h2 id="books-grid-title" class="sr-only">Liste des livres</h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          role="grid"
          aria-label="Grille des livres du catalogue"
        >
          <app-book-card
            *ngFor="
              let book of catalogStore.filteredBooks();
              trackBy: trackByBookId
            "
            [book]="book"
            [searchTerm]="searchQuery()"
            [showBorrowButton]="
              authStore.isAuthenticated() && !authStore.isAdmin()
            "
            [showEditButton]="authStore.isAdmin()"
            (viewDetails)="onViewDetails($event)"
            (borrow)="onBorrowBook($event)"
            (edit)="onEditBook($event)"
            role="gridcell"
          />
        </div>
      </section>

      <!-- Empty state -->
      <section
        *ngIf="catalogStore.filteredBooks().length === 0"
        class="text-center py-12"
        aria-live="polite"
      >
        <p class="text-gray-500">
          Aucun livre trouvé pour les critères sélectionnés.
        </p>
      </section>
    </div>
  `,
  styles: [],
})
export class CatalogPage implements OnInit, OnDestroy {
  private refreshInterval?: ReturnType<typeof globalThis.setInterval>;
  readonly catalogStore = inject(CatalogStore);
  readonly authStore = inject(AuthStore);
  readonly loansStore = inject(LoansStore);
  private readonly router = inject(Router);
  private readonly focusService = inject(FocusManagementService);

  ngOnInit(): void {
    // Focus on main heading for accessibility
    this.focusService.focusOnMainHeading();

    // Rafraîchir le catalogue toutes les 20 secondes pour tous les utilisateurs
    this.refreshInterval = globalThis.setInterval(() => {
      this.catalogStore.refreshBooks();
    }, 20000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      globalThis.clearInterval(this.refreshInterval);
    }
  }

  readonly searchQuery = computed(() => this.catalogStore.query());
  readonly selectedCategoryId = computed(() =>
    this.catalogStore.selectedCategoryId()
  );

  readonly hasActiveFilters = computed(() => {
    return !!(this.searchQuery() || this.selectedCategoryId());
  });

  onSearchChange(query: string): void {
    this.catalogStore.setQuery(query);
  }

  onCategoryChange(categoryId: string): void {
    this.catalogStore.setSelectedCategoryId(categoryId || null);
  }

  onClearFilters(): void {
    this.catalogStore.clearFilters();
  }

  onViewDetails(bookId: string): void {
    this.router.navigate(['/catalog', bookId]);
  }

  onBorrowBook(bookId: string): void {
    const currentUser = this.authStore.currentUser();
    if (currentUser) {
      // Créer l'emprunt sans modification optimiste
      this.loansStore.createLoan({
        userId: currentUser.id,
        bookId: bookId,
      });

      // Rafraîchir le catalogue après un court délai pour laisser temps à l'API mock
      setTimeout(() => {
        this.catalogStore.refreshBooks();
      }, 100);

      // Optionnel : rediriger vers les emprunts après création
      // this.router.navigate(['/loans/mine']);
    }
  }

  onEditBook(bookId: string): void {
    this.router.navigate(['/catalog', bookId, 'edit']);
  }

  onAddBook(): void {
    this.router.navigate(['/catalog', 'new']);
  }

  trackByCategoryId(_index: number, category: { id: string }): string {
    return category.id;
  }

  trackByBookId(_index: number, book: { id: string }): string {
    return book.id;
  }
}
