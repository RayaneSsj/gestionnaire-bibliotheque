import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

import { UserRole, RegisterPayload } from '../../features/auth/data';
import { LoanStatus } from '../../shared/models';
import {
  mockDb,
  generateToken,
  findUserByCredentials,
  createUser,
  updateBookAvailability,
  isEmailTaken,
} from '../mock-db';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  if (!url.startsWith('/api/')) {
    return next(req);
  }

  const randomDelay = Math.random() * 500 + 300;

  if (req.method === 'POST' && url === '/api/auth/login') {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Email et mot de passe requis' },
          })
      ).pipe(delay(randomDelay));
    }

    const user = findUserByCredentials(email, password);
    if (!user) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: { message: 'Email ou mot de passe incorrect' },
          })
      ).pipe(delay(randomDelay));
    }

    const token = generateToken(user.id);
    return of(
      new HttpResponse({
        status: 200,
        body: { user, token },
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'POST' && url === '/api/auth/register') {
    const payload = req.body as RegisterPayload;

    if (!payload.email || !payload.password || !payload.displayName) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Tous les champs sont requis' },
          })
      ).pipe(delay(randomDelay));
    }

    if (isEmailTaken(payload.email)) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { message: 'Cet email est déjà utilisé' },
          })
      ).pipe(delay(randomDelay));
    }

    if (payload.password !== payload.confirmPassword) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Les mots de passe ne correspondent pas' },
          })
      ).pipe(delay(randomDelay));
    }

    const user = createUser(payload.email, payload.displayName);
    const token = generateToken(user.id);

    return of(
      new HttpResponse({
        status: 201,
        body: { user, token },
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url === '/api/auth/me') {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: { message: "Token d'authentification requis" },
          })
      ).pipe(delay(randomDelay));
    }

    const token = authHeader.substring(7);
    const userId = Object.keys(mockDb.tokens).find(
      id => mockDb.tokens[id].accessToken === token
    );

    if (!userId) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: { message: 'Token invalide' },
          })
      ).pipe(delay(randomDelay));
    }

    const user = mockDb.users.find(u => u.id === userId);
    if (!user) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Utilisateur non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    return of(
      new HttpResponse({
        status: 200,
        body: user,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url === '/api/books') {
    const books = mockDb.books.map(book => ({
      ...book,
      author: mockDb.authors.find(a => a.id === book.authorId),
      category: mockDb.categories.find(c => c.id === book.categoryId),
    }));

    return of(
      new HttpResponse({
        status: 200,
        body: books,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url.startsWith('/api/books/')) {
    const bookId = url.split('/').pop();
    const book = mockDb.books.find(b => b.id === bookId);

    if (!book) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Livre non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    const enrichedBook = {
      ...book,
      author: mockDb.authors.find(a => a.id === book.authorId),
      category: mockDb.categories.find(c => c.id === book.categoryId),
    };

    return of(
      new HttpResponse({
        status: 200,
        body: enrichedBook,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'POST' && url === '/api/books') {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: { message: 'Authentification requise' },
          })
      ).pipe(delay(randomDelay));
    }

    const bookData = req.body as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const newBook = {
      id: `book_${Date.now()}`,
      ...bookData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.books.push(newBook);

    return of(
      new HttpResponse({
        status: 201,
        body: newBook,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'PUT' && url.startsWith('/api/books/')) {
    const bookId = url.split('/').pop();
    const bookIndex = mockDb.books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Livre non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    const updatedBook = {
      ...mockDb.books[bookIndex],
      ...(req.body as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      updatedAt: new Date().toISOString(),
    };

    mockDb.books[bookIndex] = updatedBook;

    return of(
      new HttpResponse({
        status: 200,
        body: updatedBook,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'DELETE' && url.startsWith('/api/books/')) {
    const bookId = url.split('/').pop();
    const bookIndex = mockDb.books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Livre non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    const hasActiveLoans = mockDb.loans.some(
      loan => loan.bookId === bookId && loan.status === LoanStatus.ACTIVE
    );

    if (hasActiveLoans) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: {
              message: 'Impossible de supprimer un livre actuellement emprunté',
            },
          })
      ).pipe(delay(randomDelay));
    }

    mockDb.books.splice(bookIndex, 1);

    return of(
      new HttpResponse({
        status: 204,
        body: null,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url === '/api/authors') {
    return of(
      new HttpResponse({
        status: 200,
        body: mockDb.authors,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url === '/api/categories') {
    return of(
      new HttpResponse({
        status: 200,
        body: mockDb.categories,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url === '/api/loans') {
    const loans = mockDb.loans.map(loan => ({
      ...loan,
      book: mockDb.books.find(b => b.id === loan.bookId),
      user: mockDb.users.find(u => u.id === loan.userId),
    }));

    return of(
      new HttpResponse({
        status: 200,
        body: loans,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'POST' && url === '/api/loans') {
    const { userId, bookId } = req.body as { userId: string; bookId: string };

    const book = mockDb.books.find(b => b.id === bookId);
    if (!book) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Livre non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    if (book.availableCopies <= 0) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { message: 'Aucun exemplaire disponible' },
          })
      ).pipe(delay(randomDelay));
    }

    // Vérifier si l'utilisateur a déjà emprunté ce livre
    const existingLoan = mockDb.loans.find(
      loan =>
        loan.userId === userId &&
        loan.bookId === bookId &&
        loan.status === LoanStatus.ACTIVE
    );

    if (existingLoan) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { message: 'Vous avez déjà emprunté ce livre' },
          })
      ).pipe(delay(randomDelay));
    }

    const activeUserLoans = mockDb.loans.filter(
      loan => loan.userId === userId && loan.status === LoanStatus.ACTIVE
    ).length;

    if (activeUserLoans >= 3) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: {
              message: "Limite d'emprunts simultanés atteinte (3 maximum)",
            },
          })
      ).pipe(delay(randomDelay));
    }

    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt);
    dueDate.setDate(dueDate.getDate() + 14);

    const newLoan = {
      id: `loan_${Date.now()}`,
      userId,
      bookId,
      borrowedAt: borrowedAt.toISOString(),
      dueDate: dueDate.toISOString(),
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      renewalCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.loans.push(newLoan);
    updateBookAvailability(bookId, -1);

    const member = mockDb.members.find(m => m.id === userId);
    if (member) {
      member.borrowedBooksCount++;
    }

    // Enrichir le prêt avec les détails du livre et de l'utilisateur
    const enrichedLoan = {
      ...newLoan,
      book: {
        id: book.id,
        title: book.title,
        author:
          mockDb.authors.find(a => a.id === book.authorId)?.firstName +
            ' ' +
            mockDb.authors.find(a => a.id === book.authorId)?.lastName ||
          'Auteur inconnu',
        isbn: book.isbn,
      },
      user: mockDb.users.find(u => u.id === userId),
    };

    return of(
      new HttpResponse({
        status: 201,
        body: enrichedLoan,
      })
    ).pipe(delay(randomDelay));
  }

  if (
    req.method === 'PUT' &&
    url.includes('/api/loans/') &&
    url.endsWith('/return')
  ) {
    const loanId = url.split('/')[3];
    const loan = mockDb.loans.find(l => l.id === loanId);

    if (!loan) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Emprunt non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    if (
      loan.status !== LoanStatus.ACTIVE &&
      loan.status !== LoanStatus.OVERDUE
    ) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { message: 'Cet emprunt a déjà été retourné' },
          })
      ).pipe(delay(randomDelay));
    }

    loan.returnedAt = new Date().toISOString();
    loan.status = LoanStatus.RETURNED;
    loan.updatedAt = new Date().toISOString();

    updateBookAvailability(loan.bookId, 1);

    const member = mockDb.members.find(m => m.id === loan.userId);
    if (member) {
      member.borrowedBooksCount = Math.max(0, member.borrowedBooksCount - 1);
    }

    // Enrichir le prêt avec les détails du livre et de l'utilisateur
    const book = mockDb.books.find(b => b.id === loan.bookId);
    const enrichedLoan = {
      ...loan,
      book: book
        ? {
            id: book.id,
            title: book.title,
            author:
              mockDb.authors.find(a => a.id === book.authorId)?.firstName +
                ' ' +
                mockDb.authors.find(a => a.id === book.authorId)?.lastName ||
              'Auteur inconnu',
            isbn: book.isbn,
          }
        : undefined,
      user: mockDb.users.find(u => u.id === loan.userId),
    };

    return of(
      new HttpResponse({
        status: 200,
        body: enrichedLoan,
      })
    ).pipe(delay(randomDelay));
  }

  if (
    req.method === 'PUT' &&
    url.includes('/api/loans/') &&
    url.endsWith('/renew')
  ) {
    const loanId = url.split('/')[3];
    const loan = mockDb.loans.find(l => l.id === loanId);

    if (!loan) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Emprunt non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    if (loan.status !== LoanStatus.ACTIVE) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: {
              message: 'Seuls les emprunts actifs peuvent être renouvelés',
            },
          })
      ).pipe(delay(randomDelay));
    }

    if (loan.renewalCount >= 2) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: {
              message: 'Limite de renouvellements atteinte (2 maximum)',
            },
          })
      ).pipe(delay(randomDelay));
    }

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    loan.dueDate = newDueDate.toISOString();
    loan.renewalCount++;
    loan.updatedAt = new Date().toISOString();

    // Enrichir le prêt avec les détails du livre et de l'utilisateur
    const book = mockDb.books.find(b => b.id === loan.bookId);
    const enrichedLoan = {
      ...loan,
      book: book
        ? {
            id: book.id,
            title: book.title,
            author:
              mockDb.authors.find(a => a.id === book.authorId)?.firstName +
                ' ' +
                mockDb.authors.find(a => a.id === book.authorId)?.lastName ||
              'Auteur inconnu',
            isbn: book.isbn,
          }
        : undefined,
      user: mockDb.users.find(u => u.id === loan.userId),
    };

    return of(
      new HttpResponse({
        status: 200,
        body: enrichedLoan,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'GET' && url === '/api/members') {
    return of(
      new HttpResponse({
        status: 200,
        body: mockDb.members,
      })
    ).pipe(delay(randomDelay));
  }

  if (req.method === 'PUT' && url.startsWith('/api/members/')) {
    const memberId = url.split('/').pop();
    const memberIndex = mockDb.members.findIndex(m => m.id === memberId);

    if (memberIndex === -1) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: 'Membre non trouvé' },
          })
      ).pipe(delay(randomDelay));
    }

    const { role } = req.body as { role: UserRole };

    if (role && Object.values(UserRole).includes(role)) {
      mockDb.members[memberIndex].role = role;
      mockDb.members[memberIndex].updatedAt = new Date().toISOString();

      const userIndex = mockDb.users.findIndex(u => u.id === memberId);
      if (userIndex !== -1) {
        mockDb.users[userIndex].role = role;
        mockDb.users[userIndex].updatedAt = new Date().toISOString();
      }
    }

    return of(
      new HttpResponse({
        status: 200,
        body: mockDb.members[memberIndex],
      })
    ).pipe(delay(randomDelay));
  }

  return throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Endpoint non trouvé' },
      })
  ).pipe(delay(randomDelay));
};
