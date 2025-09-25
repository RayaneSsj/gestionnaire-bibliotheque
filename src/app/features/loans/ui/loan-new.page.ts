import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  effect,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserRole } from '../../auth/data';
import { CatalogStore, BookWithDetails } from '../../catalog/catalog.store';
import { Book } from '../../catalog/data';
import { LoansStore } from '../loans.store';

@Component({
  selector: 'app-loan-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <button
            type="button"
            (click)="goBack()"
            class="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            ← Retour
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Nouvel emprunt</h1>
        </div>
        <p class="text-gray-600">
          Créer un nouvel emprunt pour un membre de la bibliothèque
        </p>
      </div>

      <!-- Messages d'erreur globaux -->
      <div
        *ngIf="loansStore.error()"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div class="flex">
          <div class="text-red-600 mr-3">⚠️</div>
          <div class="text-red-800">{{ loansStore.error() }}</div>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <form [formGroup]="loanForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Sélection du membre -->
          <div>
            <label
              for="userId"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Membre <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="userSearch"
                type="text"
                [(ngModel)]="userSearchQuery"
                [ngModelOptions]="{ standalone: true }"
                (input)="filterUsers()"
                placeholder="Rechercher par nom ou email..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="isFieldInvalid('userId')"
              />

              <!-- Dropdown des utilisateurs -->
              <div
                *ngIf="showUserDropdown && filteredUsers().length > 0"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <button
                  *ngFor="let user of filteredUsers(); trackBy: trackByUserId"
                  type="button"
                  (click)="selectUser(user)"
                  class="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium">{{ user.displayName }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </button>
              </div>
            </div>

            <!-- Utilisateur sélectionné -->
            <div
              *ngIf="selectedUser"
              class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-blue-900">
                    {{ selectedUser.displayName }}
                  </div>
                  <div class="text-sm text-blue-700">
                    {{ selectedUser.email }}
                  </div>
                </div>
                <button
                  type="button"
                  (click)="clearSelectedUser()"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              *ngIf="isFieldInvalid('userId')"
              class="mt-1 text-sm text-red-600"
            >
              Veuillez sélectionner un membre
            </div>
          </div>

          <!-- Sélection du livre -->
          <div>
            <label
              for="bookId"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Livre <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="bookSearch"
                type="text"
                [(ngModel)]="bookSearchQuery"
                [ngModelOptions]="{ standalone: true }"
                (input)="filterBooks()"
                placeholder="Rechercher par titre ou auteur..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="isFieldInvalid('bookId')"
              />

              <!-- Dropdown des livres -->
              <div
                *ngIf="showBookDropdown && availableBooks().length > 0"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <button
                  *ngFor="let book of availableBooks(); trackBy: trackByBookId"
                  type="button"
                  (click)="selectBook(book)"
                  class="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium">{{ book.title }}</div>
                  <div class="text-sm text-gray-500">
                    par
                    {{
                      book.author
                        ? book.author.firstName + ' ' + book.author.lastName
                        : 'Auteur inconnu'
                    }}
                  </div>
                  <div class="text-xs text-green-600">
                    {{ book.availableCopies }} exemplaire(s) disponible(s)
                  </div>
                </button>
              </div>

              <div
                *ngIf="
                  showBookDropdown &&
                  availableBooks().length === 0 &&
                  bookSearchQuery.length > 0
                "
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-center text-gray-500"
              >
                Aucun livre disponible trouvé
              </div>
            </div>

            <!-- Livre sélectionné -->
            <div
              *ngIf="selectedBook"
              class="mt-2 p-3 bg-green-50 border border-green-200 rounded-md"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-green-900">
                    {{ selectedBook.title }}
                  </div>
                  <div class="text-sm text-green-700">
                    par
                    {{
                      selectedBook.author
                        ? selectedBook.author.firstName +
                          ' ' +
                          selectedBook.author.lastName
                        : 'Auteur inconnu'
                    }}
                  </div>
                  <div class="text-xs text-green-600">
                    {{ selectedBook.availableCopies }} exemplaire(s)
                    disponible(s)
                  </div>
                </div>
                <button
                  type="button"
                  (click)="clearSelectedBook()"
                  class="text-green-600 hover:text-green-800 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              *ngIf="isFieldInvalid('bookId')"
              class="mt-1 text-sm text-red-600"
            >
              Veuillez sélectionner un livre
            </div>
          </div>

          <!-- Informations sur les durées -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              Informations sur l'emprunt
            </h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Durée standard : 14 jours</li>
              <li>• Renouvellements possibles : 2 maximum</li>
              <li>• Date de retour prévue : {{ formatDueDate() }}</li>
            </ul>
          </div>

          <!-- Boutons -->
          <div class="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              (click)="goBack()"
              class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="loanForm.invalid || loansStore.isLoading()"
              class="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                *ngIf="loansStore.isLoading()"
                class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              ></span>
              {{ loansStore.isLoading() ? 'Création...' : "Créer l'emprunt" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoanNewPage {
  readonly loansStore = inject(LoansStore);
  readonly catalogStore = inject(CatalogStore);
  readonly router = inject(Router);
  readonly fb = inject(FormBuilder);

  // Form
  readonly loanForm = this.fb.nonNullable.group({
    userId: ['', [Validators.required]],
    bookId: ['', [Validators.required]],
  });

  // Search queries
  userSearchQuery = '';
  bookSearchQuery = '';

  // Track form submission
  private _formSubmitted = signal(false);

  // Dropdowns visibility
  showUserDropdown = false;
  showBookDropdown = false;

  // Selected items
  selectedUser: User | null = null;
  selectedBook: BookWithDetails | null = null;

  // Mock users data (in real app, this would come from a UsersStore)
  private readonly _mockUsers = [
    {
      id: '1',
      displayName: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      displayName: 'Marie Martin',
      email: 'marie.martin@example.com',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '3',
      displayName: 'Pierre Durand',
      email: 'pierre.durand@example.com',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '4',
      displayName: 'Sophie Bernard',
      email: 'sophie.bernard@example.com',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
  ];

  readonly filteredUsers = computed(() => {
    const query = this.userSearchQuery.toLowerCase().trim();
    if (!query) {
      return this._mockUsers;
    }

    return this._mockUsers.filter(
      user =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  });

  readonly availableBooks = computed(() => {
    const query = this.bookSearchQuery.toLowerCase().trim();
    let books = this.catalogStore.availableBooks();

    if (query) {
      books = books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author
          ? `${book.author.firstName} ${book.author.lastName}`
              .toLowerCase()
              .includes(query)
          : false;
        return titleMatch || authorMatch;
      });
    }

    return books.slice(0, 10); // Limite à 10 résultats pour la performance
  });

  constructor() {
    // Écouter les clics pour fermer les dropdowns
    if (
      typeof globalThis !== 'undefined' &&
      typeof globalThis.document !== 'undefined'
    ) {
      globalThis.document.addEventListener('click', event => {
        const target = event.target as HTMLElement;
        if (!target.closest('#userSearch') && !target.closest('.absolute')) {
          this.showUserDropdown = false;
        }
        if (!target.closest('#bookSearch') && !target.closest('.absolute')) {
          this.showBookDropdown = false;
        }
      });
    }

    // Effect pour rediriger après création réussie
    effect(() => {
      const isLoading = this.loansStore.isLoading();
      const error = this.loansStore.error();

      if (!isLoading && !error && this._formSubmitted()) {
        // Le catalogue sera automatiquement rafraîchi par le LoansStore
        this.router.navigate(['/loans/all']);
      }
    });
  }

  filterUsers(): void {
    this.showUserDropdown = this.userSearchQuery.length > 0;
  }

  filterBooks(): void {
    this.showBookDropdown = this.bookSearchQuery.length > 0;
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.userSearchQuery = user.displayName;
    this.loanForm.patchValue({ userId: user.id });
    this.showUserDropdown = false;
  }

  selectBook(book: Book): void {
    this.selectedBook = this.catalogStore.getBookById(book.id) || null;
    this.bookSearchQuery = book.title;
    this.loanForm.patchValue({ bookId: book.id });
    this.showBookDropdown = false;
  }

  clearSelectedUser(): void {
    this.selectedUser = null;
    this.userSearchQuery = '';
    this.loanForm.patchValue({ userId: '' });
  }

  clearSelectedBook(): void {
    this.selectedBook = null;
    this.bookSearchQuery = '';
    this.loanForm.patchValue({ bookId: '' });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loanForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatDueDate(): string {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 jours

    return dueDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onSubmit(): void {
    if (this.loanForm.valid && this.selectedUser && this.selectedBook) {
      this._formSubmitted.set(true);

      const formData = {
        userId: this.selectedUser.id,
        bookId: this.selectedBook.id,
      };

      this.loansStore.createLoan(formData);
      // Rafraîchir le catalogue après un court délai pour laisser temps à l'API mock
      setTimeout(() => {
        this.catalogStore.refreshBooks();
      }, 100);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loanForm.controls).forEach(key => {
        const control = this.loanForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  trackByUserId(_index: number, user: User): string {
    return user.id;
  }

  trackByBookId(_index: number, book: Book): string {
    return book.id;
  }

  goBack(): void {
    this.router.navigate(['/loans/all']);
  }
}
