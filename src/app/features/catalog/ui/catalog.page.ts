import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthStore } from '../../../core';
import { LoansStore } from '../../loans/loans.store';
import { CatalogStore } from '../catalog.store';

import { BookCardComponent } from './book-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-900">Catalogue des livres</h1>
          <button
            *ngIf="authStore.isAdmin()"
            type="button"
            (click)="onAddBook()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            + Ajouter un livre
          </button>
        </div>

        <!-- Statistiques -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
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
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Rechercher par titre ou auteur..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
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
              [ngModel]="selectedCategoryId()"
              (ngModelChange)="onCategoryChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              <option
                *ngFor="let category of catalogStore.categories()"
                [value]="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Actions de filtrage -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t">
          <button
            *ngIf="hasActiveFilters()"
            type="button"
            (click)="onClearFilters()"
            class="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Effacer tous les filtres
          </button>
        </div>
      </div>

      <!-- Grille des livres -->
      <div
        *ngIf="catalogStore.filteredBooks().length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <app-book-card
          *ngFor="
            let book of catalogStore.filteredBooks();
            trackBy: trackByBookId
          "
          [book]="book"
          [showBorrowButton]="
            authStore.isAuthenticated() && !authStore.isAdmin()
          "
          [showEditButton]="authStore.isAdmin()"
          (viewDetails)="onViewDetails($event)"
          (borrow)="onBorrowBook($event)"
          (edit)="onEditBook($event)"
        />
      </div>

      <!-- Empty state -->
      <div
        *ngIf="catalogStore.filteredBooks().length === 0"
        class="text-center py-12"
      >
        <p class="text-gray-500">Aucun livre trouvé.</p>
      </div>
    </div>
  `,
  styles: [],
})
export class CatalogPage {
  readonly catalogStore = inject(CatalogStore);
  readonly authStore = inject(AuthStore);
  readonly loansStore = inject(LoansStore);
  private readonly router = inject(Router);

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

      // La diminution de la quantité sera gérée automatiquement
      // par l'intercepteur mock API qui modifie déjà availableCopies
      // On ne fait plus de modification optimiste ici pour éviter
      // les désynchronisations en cas d'erreur

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

  trackByBookId(_index: number, book: { id: string }): string {
    return book.id;
  }
}
