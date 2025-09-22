import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CatalogStore } from '../../catalog/catalog.store';
import { LoanStatus } from '../data';
import { LoansStore } from '../loans.store';

@Component({
  selector: 'app-all-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-900">Gestion des emprunts</h1>
          <button
            type="button"
            (click)="onNewLoan()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            + Nouvel emprunt
          </button>
        </div>

        <!-- Statistiques -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">
                {{ loansStore.activeLoansCount() }}
              </div>
              <div class="text-sm text-gray-600">Emprunts actifs</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600">
                {{ loansStore.overdueLoansCount() }}
              </div>
              <div class="text-sm text-gray-600">En retard</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-600">
                {{ loansStore.loans().length }}
              </div>
              <div class="text-sm text-gray-600">Total emprunts</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">
                {{ filteredLoans().length }}
              </div>
              <div class="text-sm text-gray-600">Résultats affichés</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Recherche par utilisateur -->
          <div>
            <label
              for="userSearch"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Rechercher par utilisateur
            </label>
            <input
              id="userSearch"
              type="text"
              [(ngModel)]="userSearchQuery"
              (input)="updateFilters()"
              placeholder="Nom, email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Recherche par livre -->
          <div>
            <label
              for="bookSearch"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Rechercher par livre
            </label>
            <input
              id="bookSearch"
              type="text"
              [(ngModel)]="bookSearchQuery"
              (input)="updateFilters()"
              placeholder="Titre, auteur..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Filtre par statut -->
          <div>
            <label
              for="statusFilter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Statut
            </label>
            <select
              id="statusFilter"
              [(ngModel)]="statusFilter"
              (change)="updateFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="returned">Rendus</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>

          <!-- Boutons d'actions -->
          <div class="flex items-end space-x-2">
            <button
              type="button"
              (click)="clearFilters()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Effacer
            </button>
            <button
              type="button"
              (click)="refreshLoans()"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Actualiser
            </button>
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

      <!-- Liste des emprunts -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Utilisateur
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Livre
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Emprunt
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Retour prévu
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                *ngFor="let loan of filteredLoans(); trackBy: trackByLoanId"
                class="hover:bg-gray-50 transition-colors duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ loan.user?.firstName || 'Prénom' }}
                    {{ loan.user?.lastName || 'Nom' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ loan.user?.email || 'email@example.com' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ loan.book?.title || 'Titre inconnu' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ loan.book?.author || 'Auteur inconnu' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(loan.borrowedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span [class]="getDueDateClass(loan)">
                    {{ formatDate(loan.dueDate) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getStatusClass(loan.status)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusLabel(loan.status) }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2"
                >
                  <button
                    *ngIf="canReturn(loan)"
                    (click)="returnLoan(loan.id)"
                    [disabled]="loansStore.isLoading()"
                    class="text-green-600 hover:text-green-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retourner
                  </button>
                  <button
                    *ngIf="canRenew(loan)"
                    (click)="renewLoan(loan.id)"
                    [disabled]="loansStore.isLoading()"
                    class="text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Renouveler
                  </button>
                  <button
                    *ngIf="canCancel(loan)"
                    (click)="cancelLoan(loan.id)"
                    [disabled]="loansStore.isLoading()"
                    class="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="filteredLoans().length === 0 && !loansStore.isLoading()"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Aucun emprunt trouvé
        </h3>
        <p class="text-gray-600">
          Essayez de modifier vos critères de recherche ou créez un nouvel
          emprunt.
        </p>
      </div>
    </div>
  `,
})
export class AllLoansPage {
  readonly loansStore = inject(LoansStore);
  readonly catalogStore = inject(CatalogStore);
  readonly router = inject(Router);

  // Filtres
  userSearchQuery = signal('');
  bookSearchQuery = signal('');
  statusFilter = signal<string>('');

  readonly filteredLoans = computed(() => {
    let loans = this.loansStore.loans();

    // Filtre par utilisateur
    const userQuery = this.userSearchQuery().toLowerCase().trim();
    if (userQuery) {
      loans = loans.filter(loan => {
        const userFullName =
          `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.toLowerCase();
        const userEmail = (loan.user?.email || '').toLowerCase();
        return (
          userFullName.includes(userQuery) || userEmail.includes(userQuery)
        );
      });
    }

    // Filtre par livre
    const bookQuery = this.bookSearchQuery().toLowerCase().trim();
    if (bookQuery) {
      loans = loans.filter(loan => {
        const bookTitle = (loan.book?.title || '').toLowerCase();
        const bookAuthor = (loan.book?.author || '').toLowerCase();
        return bookTitle.includes(bookQuery) || bookAuthor.includes(bookQuery);
      });
    }

    // Filtre par statut
    const status = this.statusFilter();
    if (status) {
      if (status === 'overdue') {
        const now = new Date();
        loans = loans.filter(loan => {
          if (loan.status !== LoanStatus.ACTIVE) {
            return false;
          }
          const dueDate = new Date(loan.dueDate);
          return dueDate < now;
        });
      } else {
        loans = loans.filter(loan => loan.status === status);
      }
    }

    return loans.sort(
      (a, b) =>
        new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
    );
  });

  updateFilters(): void {
    // Les computed se mettront à jour automatiquement
  }

  clearFilters(): void {
    this.userSearchQuery.set('');
    this.bookSearchQuery.set('');
    this.statusFilter.set('');
  }

  refreshLoans(): void {
    this.loansStore.refreshLoans();
  }

  onNewLoan(): void {
    this.router.navigate(['/loans/new']);
  }

  returnLoan(loanId: string): void {
    // Retourner le livre - le catalogue sera automatiquement rafraîchi
    this.loansStore.returnLoan(loanId);
  }

  renewLoan(loanId: string): void {
    this.loansStore.renewLoan(loanId);
  }

  cancelLoan(loanId: string): void {
    this.loansStore.updateLoanStatus(loanId, LoanStatus.CANCELLED);
  }

  canReturn(loan: any): boolean {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return loan.status === LoanStatus.ACTIVE;
  }

  canRenew(loan: any): boolean {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return loan.status === LoanStatus.ACTIVE && loan.renewalCount < 2;
  }

  canCancel(loan: any): boolean {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return loan.status === LoanStatus.ACTIVE;
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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (loan.status === LoanStatus.RETURNED) {
      return 'text-gray-600';
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

    return 'text-gray-600';
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  }

  trackByLoanId(_index: number, loan: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return loan.id;
  }
}
