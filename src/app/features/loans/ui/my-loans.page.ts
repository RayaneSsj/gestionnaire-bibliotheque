import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';

import { AuthStore } from '../../../core';
import { CatalogStore } from '../../catalog/catalog.store';
import { LoanStatus } from '../data';
import { LoansStore } from '../loans.store';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Mes emprunts</h1>

        <!-- Statistiques -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">
                {{ activeLoans().length }}
              </div>
              <div class="text-sm text-gray-600">Emprunts actifs</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600">
                {{ overdueLoans().length }}
              </div>
              <div class="text-sm text-gray-600">En retard</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">
                {{ returnedLoans().length }}
              </div>
              <div class="text-sm text-gray-600">Rendus</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div
        *ngIf="loansStore.error()"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div class="flex">
          <div class="text-red-600 mr-3">⚠️</div>
          <div class="text-red-800">{{ loansStore.error() }}</div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loansStore.isLoading()" class="text-center py-8">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-8 border-b border-gray-200">
          <button
            *ngFor="let tab of tabs"
            (click)="selectedTab = tab.key"
            [class]="getTabClass(tab.key)"
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
          >
            {{ tab.label }}
            <span
              *ngIf="getTabCount(tab.key) > 0"
              class="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs"
            >
              {{ getTabCount(tab.key) }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Liste des emprunts -->
      <div class="space-y-4">
        <div
          *ngFor="let loan of getFilteredLoans(); trackBy: trackByLoanId"
          class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 mr-3">
                    {{ loan.book?.title || 'Titre inconnu' }}
                  </h3>
                  <span
                    [class]="getStatusClass(loan.status)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusLabel(loan.status) }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 mb-2">
                  par {{ loan.book?.author || 'Auteur inconnu' }}
                </p>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600"
                >
                  <div>
                    <span class="font-medium">Date d'emprunt :</span>
                    {{ formatDate(loan.borrowedAt) }}
                  </div>
                  <div>
                    <span class="font-medium">Date de retour :</span>
                    <span [class]="getDueDateClass(loan)">
                      {{ formatDate(loan.dueDate) }}
                    </span>
                  </div>
                  <div *ngIf="loan.returnedAt">
                    <span class="font-medium">Rendu le :</span>
                    {{ formatDate(loan.returnedAt) }}
                  </div>
                  <div *ngIf="loan.renewalCount > 0">
                    <span class="font-medium">Renouvellements :</span>
                    {{ loan.renewalCount }}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col space-y-2 ml-4">
                <button
                  *ngIf="canReturn(loan)"
                  (click)="returnLoan(loan.id)"
                  [disabled]="loansStore.isLoading()"
                  class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Retourner
                </button>

                <button
                  *ngIf="canRenew(loan)"
                  (click)="renewLoan(loan.id)"
                  [disabled]="loansStore.isLoading()"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Renouveler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty states -->
      <div
        *ngIf="getFilteredLoans().length === 0 && !loansStore.isLoading()"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ getEmptyMessage() }}
        </h3>
        <p class="text-gray-600">{{ getEmptySubMessage() }}</p>
      </div>
    </div>
  `,
})
export class MyLoansPage {
  readonly loansStore = inject(LoansStore);
  readonly authStore = inject(AuthStore);
  readonly catalogStore = inject(CatalogStore);

  selectedTab: 'active' | 'returned' | 'all' = 'active';

  readonly tabs = [
    { key: 'active' as const, label: 'Emprunts actifs' },
    { key: 'returned' as const, label: 'Historique' },
    { key: 'all' as const, label: 'Tous' },
  ];

  readonly myLoans = computed(() => this.loansStore.myLoans());

  readonly activeLoans = computed(() =>
    this.myLoans().filter(loan => loan.status === LoanStatus.ACTIVE)
  );

  readonly overdueLoans = computed(() => {
    const now = new Date();
    return this.activeLoans().filter(loan => {
      const dueDate = new Date(loan.dueDate);
      return dueDate < now;
    });
  });

  readonly returnedLoans = computed(() =>
    this.myLoans().filter(loan => loan.status === LoanStatus.RETURNED)
  );

  getFilteredLoans() {
    switch (this.selectedTab) {
      case 'active':
        return this.activeLoans();
      case 'returned':
        return this.returnedLoans();
      case 'all':
      default:
        return this.myLoans();
    }
  }

  getTabCount(tabKey: string): number {
    switch (tabKey) {
      case 'active':
        return this.activeLoans().length;
      case 'returned':
        return this.returnedLoans().length;
      case 'all':
        return this.myLoans().length;
      default:
        return 0;
    }
  }

  getTabClass(tabKey: string): string {
    const baseClass =
      this.selectedTab === tabKey
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    return baseClass;
  }

  getStatusClass(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case LoanStatus.RETURNED:
        return 'bg-green-100 text-green-800';
      case LoanStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case LoanStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.ACTIVE:
        return 'Actif';
      case LoanStatus.RETURNED:
        return 'Rendu';
      case LoanStatus.OVERDUE:
        return 'En retard';
      case LoanStatus.CANCELLED:
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  getDueDateClass(loan: any): string {
     
    if (loan.status === LoanStatus.RETURNED) {
      return '';
    }

    const now = new Date();
    const dueDate = new Date(loan.dueDate);

    if (dueDate < now) {
      return 'text-red-600 font-medium';
    }

    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      return 'text-orange-600 font-medium';
    }

    return '';
  }

  canReturn(loan: any): boolean {
     
    return loan.status === LoanStatus.ACTIVE;
  }

  canRenew(loan: any): boolean {
     
    return loan.status === LoanStatus.ACTIVE && loan.renewalCount < 2;
  }

  returnLoan(loanId: string): void {
    // Retourner le livre - le catalogue sera automatiquement rafraîchi
    this.loansStore.returnLoan(loanId);
  }

  renewLoan(loanId: string): void {
    this.loansStore.renewLoan(loanId);
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  }

  trackByLoanId(_index: number, loan: any): string {
     
    return loan.id;
  }

  getEmptyMessage(): string {
    switch (this.selectedTab) {
      case 'active':
        return 'Aucun emprunt actif';
      case 'returned':
        return 'Aucun livre rendu';
      case 'all':
        return 'Aucun emprunt';
      default:
        return 'Aucun emprunt';
    }
  }

  getEmptySubMessage(): string {
    switch (this.selectedTab) {
      case 'active':
        return "Vous n'avez aucun livre emprunté actuellement.";
      case 'returned':
        return "Vous n'avez encore rendu aucun livre.";
      case 'all':
        return "Vous n'avez effectué aucun emprunt.";
      default:
        return '';
    }
  }
}
