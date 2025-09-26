import { User, UserRole, AuthToken } from '../features/auth/data';
import { Author, Book, Category, Loan, LoanStatus } from '../shared/models';

export interface Member extends User {
  membershipDate: string;
  borrowedBooksCount: number;
}

export interface MockDatabase {
  users: User[];
  authors: Author[];
  categories: Category[];
  books: Book[];
  loans: Loan[];
  members: Member[];
  tokens: { [userId: string]: AuthToken };
}

const passwords: { [email: string]: string } = {
  'admin@test.com': 'admin',
  'user@test.com': 'user',
  'librarian@test.com': 'librarian',
  'jane@test.com': 'jane',
};

export const mockDb: MockDatabase = {
  users: [
    {
      id: '1',
      email: 'admin@test.com',
      displayName: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      email: 'user@test.com',
      displayName: 'John Doe',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: '3',
      email: 'librarian@test.com',
      displayName: 'Marie Dupont',
      role: UserRole.LIBRARIAN,
      isActive: true,
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    },
    {
      id: '4',
      email: 'jane@test.com',
      displayName: 'Jane Smith',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '2024-02-15T00:00:00.000Z',
      updatedAt: '2024-02-15T00:00:00.000Z',
    },
  ],

  authors: [
    {
      id: '1',
      firstName: 'Victor',
      lastName: 'Hugo',
      biography:
        'Écrivain français du XIXe siècle, auteur des Misérables et de Notre-Dame de Paris.',
      birthDate: '1802-02-26',
      deathDate: '1885-05-22',
      nationality: 'Française',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      firstName: 'J.K.',
      lastName: 'Rowling',
      biography: 'Auteure britannique connue pour la série Harry Potter.',
      birthDate: '1965-07-31',
      nationality: 'Britannique',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      firstName: 'Gabriel',
      lastName: 'García Márquez',
      biography: 'Écrivain colombien, prix Nobel de littérature 1982.',
      birthDate: '1927-03-06',
      deathDate: '2014-04-17',
      nationality: 'Colombienne',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '4',
      firstName: 'Agatha',
      lastName: 'Christie',
      biography: 'Romancière britannique spécialisée dans le roman policier.',
      birthDate: '1890-09-15',
      deathDate: '1976-01-12',
      nationality: 'Britannique',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],

  categories: [
    {
      id: '1',
      name: 'Littérature classique',
      description:
        'Œuvres littéraires reconnues pour leur valeur artistique et culturelle.',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Fantasy',
      description: 'Romans de fantasy et littérature fantastique.',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Réalisme magique',
      description: 'Genre littéraire mêlant réalité et éléments fantastiques.',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '4',
      name: 'Policier',
      description: 'Romans policiers et thrillers.',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '5',
      name: 'Science-fiction',
      description: 'Romans de science-fiction et anticipation.',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],

  books: [
    {
      id: '1',
      title: 'Les Misérables',
      isbn: '978-2-07-036194-1',
      authorId: '1',
      categoryId: '1',
      description: 'Roman social de Victor Hugo publié en 1862.',
      publishedDate: '1862-03-30',
      totalCopies: 3,
      availableCopies: 2,
      language: 'Français',
      pages: 1488,
      publisher: 'A. Lacroix, Verboeckhoven & Cie',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Notre-Dame de Paris',
      isbn: '978-2-07-036195-8',
      authorId: '1',
      categoryId: '1',
      description: 'Roman historique de Victor Hugo publié en 1831.',
      publishedDate: '1831-03-16',
      totalCopies: 2,
      availableCopies: 1,
      language: 'Français',
      pages: 544,
      publisher: 'Charles Gosselin',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      title: "Harry Potter à l'école des sorciers",
      isbn: '978-2-07-054120-4',
      authorId: '2',
      categoryId: '2',
      description: 'Premier tome de la saga Harry Potter.',
      publishedDate: '1997-06-26',
      totalCopies: 5,
      availableCopies: 3,
      language: 'Français',
      pages: 320,
      publisher: 'Gallimard Jeunesse',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '4',
      title: 'Cent ans de solitude',
      isbn: '978-2-02-002899-9',
      authorId: '3',
      categoryId: '3',
      description: "Chef-d'œuvre du réalisme magique.",
      publishedDate: '1967-05-30',
      totalCopies: 2,
      availableCopies: 0,
      language: 'Français',
      pages: 448,
      publisher: 'Éditions du Seuil',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '5',
      title: "Le Crime de l'Orient-Express",
      isbn: '978-2-253-00575-8',
      authorId: '4',
      categoryId: '4',
      description: "Célèbre roman policier d'Agatha Christie.",
      publishedDate: '1934-01-01',
      totalCopies: 4,
      availableCopies: 2,
      language: 'Français',
      pages: 256,
      publisher: 'Le Livre de Poche',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '6',
      title: 'Mort sur le Nil',
      isbn: '978-2-253-00576-5',
      authorId: '4',
      categoryId: '4',
      description: 'Enquête de Hercule Poirot en Égypte.',
      publishedDate: '1937-11-01',
      totalCopies: 3,
      availableCopies: 3,
      language: 'Français',
      pages: 320,
      publisher: 'Le Livre de Poche',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],

  loans: [
    {
      id: '1',
      userId: '2',
      bookId: '1',
      borrowedAt: '2024-03-01T10:00:00.000Z',
      dueDate: '2024-03-15T23:59:59.999Z',
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      renewalCount: 0,
      createdAt: '2024-03-01T10:00:00.000Z',
      updatedAt: '2024-03-01T10:00:00.000Z',
    },
    {
      id: '2',
      userId: '4',
      bookId: '2',
      borrowedAt: '2024-02-28T14:30:00.000Z',
      dueDate: '2024-03-14T23:59:59.999Z',
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      renewalCount: 1,
      createdAt: '2024-02-28T14:30:00.000Z',
      updatedAt: '2024-03-07T10:00:00.000Z',
    },
    {
      id: '3',
      userId: '2',
      bookId: '3',
      borrowedAt: '2024-02-15T09:00:00.000Z',
      dueDate: '2024-03-01T23:59:59.999Z',
      returnedAt: '2024-02-28T16:00:00.000Z',
      status: LoanStatus.RETURNED,
      renewalCount: 0,
      createdAt: '2024-02-15T09:00:00.000Z',
      updatedAt: '2024-02-28T16:00:00.000Z',
    },
    {
      id: '4',
      userId: '4',
      bookId: '4',
      borrowedAt: '2024-02-20T11:00:00.000Z',
      dueDate: '2024-03-06T23:59:59.999Z',
      returnedAt: null,
      status: LoanStatus.OVERDUE,
      renewalCount: 0,
      createdAt: '2024-02-20T11:00:00.000Z',
      updatedAt: '2024-02-20T11:00:00.000Z',
    },
    {
      id: '5',
      userId: '2',
      bookId: '4',
      borrowedAt: '2024-03-10T15:00:00.000Z',
      dueDate: '2024-03-24T23:59:59.999Z',
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      renewalCount: 0,
      createdAt: '2024-03-10T15:00:00.000Z',
      updatedAt: '2024-03-10T15:00:00.000Z',
    },
  ],

  members: [
    {
      id: '2',
      email: 'user@test.com',
      displayName: 'John Doe',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      membershipDate: '2024-01-15T00:00:00.000Z',
      borrowedBooksCount: 2,
    },
    {
      id: '4',
      email: 'jane@test.com',
      displayName: 'Jane Smith',
      role: UserRole.MEMBER,
      isActive: true,
      createdAt: '2024-02-15T00:00:00.000Z',
      updatedAt: '2024-02-15T00:00:00.000Z',
      membershipDate: '2024-02-15T00:00:00.000Z',
      borrowedBooksCount: 2,
    },
  ],

  tokens: {},
};

export function generateToken(userId: string): AuthToken {
  const token: AuthToken = {
    accessToken: `mock_access_token_${userId}_${Date.now()}`,
    refreshToken: `mock_refresh_token_${userId}_${Date.now()}`,
    expiresIn: 3600,
    tokenType: 'Bearer',
  };

  mockDb.tokens[userId] = token;
  return token;
}

export function findUserByCredentials(
  email: string,
  password: string
): User | null {
  if (passwords[email] === password) {
    return mockDb.users.find(user => user.email === email) || null;
  }

  return null;
}

export function createUser(
  email: string,
  displayName: string,
  password?: string
): User {
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    displayName,
    role: UserRole.MEMBER,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockDb.users.push(newUser);

  if (password) {
    passwords[email] = password;
  }

  const newMember: Member = {
    ...newUser,
    membershipDate: new Date().toISOString(),
    borrowedBooksCount: 0,
  };

  mockDb.members.push(newMember);

  return newUser;
}

export function updateBookAvailability(bookId: string, delta: number): void {
  const book = mockDb.books.find(b => b.id === bookId);
  if (book) {
    book.availableCopies = Math.max(
      0,
      Math.min(book.totalCopies, book.availableCopies + delta)
    );
    book.updatedAt = new Date().toISOString();
  }
}

export function isEmailTaken(email: string): boolean {
  return mockDb.users.some(
    user => user.email.toLowerCase() === email.toLowerCase()
  );
}
