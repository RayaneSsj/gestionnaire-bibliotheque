export const enum LoanStatus {
  ACTIVE = 'active', // eslint-disable-line no-unused-vars
  RETURNED = 'returned', // eslint-disable-line no-unused-vars
  OVERDUE = 'overdue', // eslint-disable-line no-unused-vars
  CANCELLED = 'cancelled', // eslint-disable-line no-unused-vars
}

// Les exports explicites ont été supprimés car non utilisés

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: LoanStatus;
  renewalCount: number;
  createdAt: string;
  updatedAt: string;
}
