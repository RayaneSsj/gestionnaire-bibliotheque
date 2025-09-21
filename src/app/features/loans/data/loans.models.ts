import { User } from '../../auth/data/auth.models';
import { Book } from '../../catalog/data/catalog.models';

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export interface Loan {
  id: string;
  bookId: string;
  book?: Book;
  userId: string;
  user?: User;
  status: LoanStatus;
  loanedAt: string;
  dueDate: string;
  returnedAt?: string;
  renewalCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}