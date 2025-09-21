export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  authorId: string;
  author?: Author;
  categoryId: string;
  category?: Category;
  description?: string;
  publishedDate: string;
  pageCount: number;
  language: string;
  totalCopies: number;
  availableCount: number;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}