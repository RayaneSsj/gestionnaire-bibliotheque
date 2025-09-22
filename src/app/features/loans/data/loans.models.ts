export enum LoanStatus {
  ACTIVE = "active",
  RETURNED = "returned", 
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

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
