import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal, inject } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

import { AuthStore } from '../../core/auth.store';

import { Loan, LoanStatus } from './data';

export interface LoanWithDetails extends Loan {
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LoansStore {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  // Signals privés
  private readonly _loans = signal<LoanWithDetails[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Signals publics en lecture seule
  readonly loans = this._loans.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed - active loans by member
  readonly activeLoansByMember = computed(() => {
    return (memberId: string) => {
      return this._loans().filter(
        loan => loan.userId === memberId && loan.status === LoanStatus.ACTIVE
      );
    };
  });

  // Computed - overdue loans
  readonly overdueLoans = computed(() => {
    const now = new Date();
    return this._loans().filter(loan => {
      if (loan.status !== LoanStatus.ACTIVE) {
        return false;
      }
      const dueDate = new Date(loan.dueDate);
      return dueDate < now;
    });
  });

  // Computed - current user's loans
  readonly myLoans = computed(() => {
    const currentUser = this.authStore.currentUser();
    if (!currentUser) {
      return [];
    }

    return this._loans().filter(loan => loan.userId === currentUser.id);
  });

  // Computed - active loans count
  readonly activeLoansCount = computed(
    () => this._loans().filter(loan => loan.status === LoanStatus.ACTIVE).length
  );

  // Computed - overdue loans count
  readonly overdueLoansCount = computed(() => this.overdueLoans().length);

  constructor() {
    this.loadLoans();
  }

  // Méthodes CRUD pour les prêts
  createLoan(loanData: { userId: string; bookId: string }): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .post<Loan>('/api/loans', loanData)
      .pipe(
        tap(newLoan => {
          const enrichedLoan = this.enrichLoanWithDetails(newLoan);
          this._loans.update(loans => [...loans, enrichedLoan]);

          // L'intercepteur mock API a mis à jour les copies disponibles
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors de la création du prêt'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  returnLoan(loanId: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .put<Loan>(`/api/loans/${loanId}/return`, {})
      .pipe(
        tap(updatedLoan => {
          const enrichedLoan = this.enrichLoanWithDetails(updatedLoan);
          this._loans.update(loans =>
            loans.map(loan => (loan.id === loanId ? enrichedLoan : loan))
          );

          // L'intercepteur mock API a augmenté les copies disponibles
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors du retour du livre'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  renewLoan(loanId: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .put<Loan>(`/api/loans/${loanId}/renew`, {})
      .pipe(
        tap(updatedLoan => {
          const enrichedLoan = this.enrichLoanWithDetails(updatedLoan);
          this._loans.update(loans =>
            loans.map(loan => (loan.id === loanId ? enrichedLoan : loan))
          );
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors du renouvellement du prêt'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  updateLoanStatus(loanId: string, status: LoanStatus): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .patch<Loan>(`/api/loans/${loanId}`, { status })
      .pipe(
        tap(updatedLoan => {
          const enrichedLoan = this.enrichLoanWithDetails(updatedLoan);
          this._loans.update(loans =>
            loans.map(loan => (loan.id === loanId ? enrichedLoan : loan))
          );
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors de la mise à jour du prêt'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  deleteLoan(loanId: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .delete(`/api/loans/${loanId}`)
      .pipe(
        tap(() => {
          this._loans.update(loans => loans.filter(loan => loan.id !== loanId));
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors de la suppression du prêt'
          );
          return of(null);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  getLoanById(loanId: string): LoanWithDetails | undefined {
    return this._loans().find(loan => loan.id === loanId);
  }

  refreshLoans(): void {
    this.loadLoans();
  }

  // Méthodes privées
  private loadLoans(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .get<Loan[]>('/api/loans')
      .pipe(
        tap(loans => {
          const enrichedLoans = loans.map(loan =>
            this.enrichLoanWithDetails(loan)
          );
          this._loans.set(enrichedLoans);
        }),
        catchError(error => {
          this._error.set(
            error.error?.message || 'Erreur lors du chargement des prêts'
          );
          return of([]);
        })
      )
      .subscribe(() => {
        this._isLoading.set(false);
      });
  }

  private enrichLoanWithDetails(loan: Loan): LoanWithDetails {
    // Pour l'instant, on retourne le prêt tel quel
    // Les détails du livre et de l'utilisateur seront enrichis par les interceptors mock API
    // En attendant, on peut utiliser des données mock ou laisser les interceptors s'en charger
    return {
      ...loan,
    };
  }
}
