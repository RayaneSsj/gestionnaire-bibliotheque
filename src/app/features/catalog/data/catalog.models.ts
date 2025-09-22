export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  authorId: string;
  categoryId: string;
  description?: string;
  publishedDate?: string;
  totalCopies: number;
  availableCopies: number;
  language?: string;
  pages?: number;
  publisher?: string;
  createdAt: string;
  updatedAt: string;
}
