import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, signal, inject } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

import { Book, Author, Category } from './data';

export interface BookWithDetails extends Book {
  author: Author | undefined;
  category: Category | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogStore {
  private readonly http = inject(HttpClient);
  private readonly QUERY_STORAGE_KEY = 'catalog_query';

  // Signals privés
  private readonly _books = signal<BookWithDetails[]>([]);
  private readonly _authors = signal<Author[]>([]);
  private readonly _categories = signal<Category[]>([]);
  private readonly _query = signal('');
  private readonly _selectedCategoryId = signal<string | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Signals publics en lecture seule
  readonly books = this._books.asReadonly();
  readonly authors = this._authors.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly query = this._query.asReadonly();
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed
  readonly filteredBooks = computed(() => {
    const books = this._books();
    const query = this._query().toLowerCase().trim();
    const categoryId = this._selectedCategoryId();

    let filtered = books;

    // Filtre par catégorie
    if (categoryId) {
      filtered = filtered.filter(book => book.categoryId === categoryId);
    }

    // Filtre par recherche (titre ou auteur)
    if (query) {
      filtered = filtered.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author
          ? `${book.author.firstName} ${book.author.lastName}`
              .toLowerCase()
              .includes(query)
          : false;
        return titleMatch || authorMatch;
      });
    }

    return filtered;
  });

  readonly availableBooks = computed(() =>
    this.filteredBooks().filter(book => book.availableCopies > 0)
  );

  readonly totalBooks = computed(() => this._books().length);
  readonly totalAvailableBooks = computed(
    () => this._books().filter(book => book.availableCopies > 0).length
  );

  constructor() {
    // Rehydratation de la query depuis sessionStorage
    this.rehydrateQuery();

    // Effect pour persister la query
    effect(() => {
      const query = this._query();
      if (query) {
        globalThis.sessionStorage?.setItem(this.QUERY_STORAGE_KEY, query);
      } else {
        globalThis.sessionStorage?.removeItem(this.QUERY_STORAGE_KEY);
      }
    });

    // Chargement initial des données
    this.loadInitialData();
  }

  // Méthodes publiques pour recherche et filtres
  setQuery(query: string): void {
    this._query.set(query);
  }

  setSelectedCategoryId(categoryId: string | null): void {
    this._selectedCategoryId.set(categoryId);
  }

  clearFilters(): void {
    this._query.set('');
    this._selectedCategoryId.set(null);
  }

  // Méthodes CRUD pour les livres
  createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .post<Book>('/api/books', bookData)
      .pipe(
        tap(newBook => {
          const enrichedBook = this.enrichBookWithDetails(newBook);
          this._books.update(books => [...books, enrichedBook]);
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors de la création du livre'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  updateBook(bookId: string, bookData: Partial<Book>): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .put<Book>(`/api/books/${bookId}`, bookData)
      .pipe(
        tap(updatedBook => {
          const enrichedBook = this.enrichBookWithDetails(updatedBook);
          this._books.update(books =>
            books.map(book => (book.id === bookId ? enrichedBook : book))
          );
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors de la mise à jour du livre'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  deleteBook(bookId: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .delete(`/api/books/${bookId}`)
      .pipe(
        tap(() => {
          this._books.update(books => books.filter(book => book.id !== bookId));
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors de la suppression du livre'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  getBookById(bookId: string): BookWithDetails | undefined {
    return this._books().find(book => book.id === bookId);
  }

  refreshBooks(): void {
    this.loadBooks();
  }

  // Méthodes privées
  private loadInitialData(): void {
    this._isLoading.set(true);
    this._error.set(null);

    // Charger authors et categories en parallèle
    Promise.all([this.loadAuthors(), this.loadCategories()])
      .then(() => {
        // Puis charger les livres une fois qu'on a les données de référence
        this.loadBooks();
      })
      .catch(() => {
        this._isLoading.set(false);
      });
  }

  private loadBooks(): void {
    this.http
      .get<Book[]>('/api/books')
      .pipe(
        tap(books => {
          const enrichedBooks = books.map(book =>
            this.enrichBookWithDetails(book)
          );
          this._books.set(enrichedBooks);
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors du chargement des livres'
          );
          return of([]);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  private loadAuthors(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .get<Author[]>('/api/authors')
        .pipe(
          tap(authors => {
            this._authors.set(authors);
          }),
          catchError(error => {
            console.error('Erreur lors du chargement des auteurs:', error);
            return of([]);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: () => reject(),
        });
    });
  }

  private loadCategories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .get<Category[]>('/api/categories')
        .pipe(
          tap(categories => {
            this._categories.set(categories);
          }),
          catchError(error => {
            console.error('Erreur lors du chargement des catégories:', error);
            return of([]);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: () => reject(),
        });
    });
  }

  private enrichBookWithDetails(book: Book): BookWithDetails {
    const authors = this._authors();
    const categories = this._categories();

    return {
      ...book,
      author: authors.find(author => author.id === book.authorId),
      category: categories.find(category => category.id === book.categoryId),
    };
  }

  private rehydrateQuery(): void {
    try {
      const storedQuery = globalThis.sessionStorage?.getItem(
        this.QUERY_STORAGE_KEY
      );
      if (storedQuery) {
        this._query.set(storedQuery);
      }
    } catch (error) {
      console.warn(
        'Impossible de recharger la query depuis sessionStorage:',
        error
      );
    }
  }
}
