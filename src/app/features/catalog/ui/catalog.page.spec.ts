import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AuthStore, FocusManagementService } from '../../../core';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { User, UserRole } from '../../auth/data';
import { LoansStore } from '../../loans/loans.store';
import { CatalogStore } from '../catalog.store';
import { Book, Category, Author } from '../data';

import { BookCardComponent } from './book-card.component';
import { CatalogPage } from './catalog.page';

describe('CatalogPage Integration Test', () => {
  let component: CatalogPage;
  let fixture: ComponentFixture<CatalogPage>;
  let mockCatalogStore: any;
  let mockAuthStore: any;
  let mockLoansStore: any;
  let mockRouter: any;
  let mockFocusService: any;

  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'Angular Guide',
      isbn: '123456789',
      authorId: '1',
      categoryId: '1',
      totalCopies: 5,
      availableCopies: 3,
      publishedDate: '2023-01-01',
      description: 'A comprehensive guide to Angular',
      language: 'English',
      pages: 300,
      publisher: 'Tech Books',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'TypeScript Handbook',
      isbn: '987654321',
      authorId: '2',
      categoryId: '1',
      totalCopies: 3,
      availableCopies: 1,
      publishedDate: '2023-02-01',
      description: 'Learn TypeScript from scratch',
      language: 'English',
      pages: 250,
      publisher: 'Dev Press',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Programming',
      description: 'Programming books',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Web Development',
      description: 'Web dev books',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  const mockAuthors: Author[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      biography: 'Tech author',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      biography: 'TS expert',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  const mockUser: User = {
    id: '1',
    email: 'admin@test.com',
    displayName: 'Admin User',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    mockCatalogStore = {
      books: signal(mockBooks),
      categories: signal(mockCategories),
      authors: signal(mockAuthors),
      query: signal(''),
      selectedCategoryId: signal(null),
      filteredBooks: signal(mockBooks),
      totalBooks: signal(mockBooks.length),
      totalAvailableBooks: signal(mockBooks.reduce((sum, book) => sum + book.availableCopies, 0)),
      setQuery: jasmine.createSpy('setQuery'),
      setSelectedCategoryId: jasmine.createSpy('setSelectedCategoryId'),
      clearFilters: jasmine.createSpy('clearFilters'),
      refreshBooks: jasmine.createSpy('refreshBooks')
    };

    mockAuthStore = {
      currentUser: signal(mockUser),
      isAuthenticated: signal(true),
      isAdmin: signal(true)
    };

    mockLoansStore = {
      createLoan: jasmine.createSpy('createLoan')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockFocusService = {
      focusOnMainHeading: jasmine.createSpy('focusOnMainHeading')
    };

    await TestBed.configureTestingModule({
      imports: [
        CatalogPage,
        FormsModule,
        CommonModule,
        BookCardComponent,
        TruncatePipe,
        HighlightPipe,
        HasRoleDirective
      ],
      providers: [
        { provide: CatalogStore, useValue: mockCatalogStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: LoansStore, useValue: mockLoansStore },
        { provide: Router, useValue: mockRouter },
        { provide: FocusManagementService, useValue: mockFocusService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call focusOnMainHeading on init', () => {
    expect(mockFocusService.focusOnMainHeading).toHaveBeenCalled();
  });

  describe('page structure', () => {
    it('should display the page title', () => {
      const titleElement = fixture.debugElement.query(By.css('h1'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Catalogue des livres');
      expect(titleElement.nativeElement.id).toBe('page-title');
    });

    it('should display statistics section', () => {
      const statsSection = fixture.debugElement.query(By.css('[aria-labelledby="stats-title"]'));
      expect(statsSection).toBeTruthy();

      const totalBooksElement = fixture.debugElement.query(By.css('.text-blue-600'));
      expect(totalBooksElement.nativeElement.textContent.trim()).toBe('2');

      const availableBooksElement = fixture.debugElement.query(By.css('.text-green-600'));
      expect(availableBooksElement.nativeElement.textContent.trim()).toBe('4');
    });

    it('should display add book button for admin users', () => {
      const addButton = fixture.debugElement.query(By.css('[aria-label="Ajouter un nouveau livre au catalogue"]'));
      expect(addButton).toBeTruthy();
      expect(addButton.nativeElement.textContent.trim()).toContain('Ajouter un livre');
    });
  });

  describe('search functionality', () => {
    it('should render search input with proper attributes', () => {
      const searchInput = fixture.debugElement.query(By.css('#search'));
      expect(searchInput).toBeTruthy();
      expect(searchInput.nativeElement.placeholder).toBe('Rechercher par titre ou auteur...');
      expect(searchInput.nativeElement.getAttribute('aria-describedby')).toBe('search-help');
    });

    it('should call catalogStore.setQuery when search input changes', () => {
      const testQuery = 'Angular';
      component.onSearchChange(testQuery);
      expect(mockCatalogStore.setQuery).toHaveBeenCalledWith(testQuery);
    });
  });

  describe('category filter', () => {
    it('should render category select with options', () => {
      const categorySelect = fixture.debugElement.query(By.css('#category'));
      expect(categorySelect).toBeTruthy();
      expect(categorySelect.nativeElement.getAttribute('aria-describedby')).toBe('category-help');

      const options = categorySelect.queryAll(By.css('option'));
      expect(options.length).toBe(3);
      expect(options[0].nativeElement.textContent.trim()).toBe('Toutes les catégories');
      expect(options[1].nativeElement.textContent.trim()).toBe('Programming');
      expect(options[2].nativeElement.textContent.trim()).toBe('Web Development');
    });

    it('should call catalogStore.setSelectedCategoryId when category changes', () => {
      component.onCategoryChange('1');
      expect(mockCatalogStore.setSelectedCategoryId).toHaveBeenCalledWith('1');
    });

    it('should handle empty category selection', () => {
      component.onCategoryChange('');
      expect(mockCatalogStore.setSelectedCategoryId).toHaveBeenCalledWith(null);
    });
  });

  describe('books grid rendering', () => {
    it('should render book cards for each book', () => {
      const bookCards = fixture.debugElement.queryAll(By.css('app-book-card'));
      expect(bookCards.length).toBe(mockBooks.length);
    });

    it('should have proper ARIA attributes on books grid', () => {
      const booksGrid = fixture.debugElement.query(By.css('[role="grid"]'));
      expect(booksGrid).toBeTruthy();
      expect(booksGrid.nativeElement.getAttribute('aria-label')).toBe('Grille des livres du catalogue');

      const gridCells = fixture.debugElement.queryAll(By.css('[role="gridcell"]'));
      expect(gridCells.length).toBe(mockBooks.length);
    });
  });

  describe('filter actions', () => {
    it('should call catalogStore.clearFilters when clear button is clicked', () => {
      component.onClearFilters();
      expect(mockCatalogStore.clearFilters).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockCatalogStore.filteredBooks.set([]);
      fixture.detectChanges();
    });

    it('should show empty state when no books match filters', () => {
      const emptyState = fixture.debugElement.query(By.css('[aria-live="polite"]'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent.trim()).toContain('Aucun livre trouvé pour les critères sélectionnés');
    });

    it('should not show books grid when no books', () => {
      const booksGrid = fixture.debugElement.query(By.css('[role="grid"]'));
      expect(booksGrid).toBeFalsy();
    });
  });

  describe('accessibility features', () => {
    it('should have proper semantic structure', () => {
      const main = fixture.debugElement.query(By.css('.container'));
      expect(main).toBeTruthy();

      const sections = fixture.debugElement.queryAll(By.css('section'));
      expect(sections.length).toBeGreaterThanOrEqual(2);

      const form = fixture.debugElement.query(By.css('form[role="search"]'));
      expect(form).toBeTruthy();
      expect(form.nativeElement.getAttribute('aria-label')).toBe('Rechercher et filtrer les livres');
    });

    it('should have screen reader friendly content', () => {
      const srOnlyElements = fixture.debugElement.queryAll(By.css('.sr-only'));
      expect(srOnlyElements.length).toBeGreaterThan(0);

      const helpTexts = fixture.debugElement.queryAll(By.css('[id$="-help"]'));
      expect(helpTexts.length).toBe(2);
    });
  });

  describe('event handlers', () => {
    it('should navigate to book details when onViewDetails is called', () => {
      component.onViewDetails('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalog', '1']);
    });

    it('should navigate to book edit when onEditBook is called', () => {
      component.onEditBook('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalog', '1', 'edit']);
    });

    it('should navigate to new book when onAddBook is called', () => {
      component.onAddBook();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalog', 'new']);
    });

    it('should create loan when onBorrowBook is called', () => {
      component.onBorrowBook('1');

      expect(mockLoansStore.createLoan).toHaveBeenCalledWith({
        userId: mockUser.id,
        bookId: '1'
      });
    });
  });
});