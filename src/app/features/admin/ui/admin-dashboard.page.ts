import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';

import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { CatalogStore } from '../../catalog/catalog.store';
import { LoansStore } from '../../loans/loans.store';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TruncatePipe, HasRoleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <!-- Utilisation de la directive hasRole pour restreindre l'accès -->
          <button
            *appHasRole="'admin'"
            type="button"
            (click)="onManageMembers()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Gérer les membres
          </button>
        </div>
        <!-- Utilisation du pipe truncate pour limiter la description -->
        <p class="text-gray-600">{{ descriptionText | truncate: 60 }}</p>
      </div>

      <!-- Cartes de statistiques principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total livres -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center"
              >
                <span class="text-white text-lg">📚</span>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-500">Total livres</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ catalogStore.totalBooks() }}
              </p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-green-600 font-medium">{{
                catalogStore.totalAvailableBooks()
              }}</span>
              <span class="text-gray-500 ml-1">disponibles</span>
            </div>
          </div>
        </div>

        <!-- Emprunts actifs -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center"
              >
                <span class="text-white text-lg">📋</span>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-500">Emprunts actifs</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ loansStore.activeLoansCount() }}
              </p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-blue-600 font-medium">{{ totalLoans() }}</span>
              <span class="text-gray-500 ml-1">total emprunts</span>
            </div>
          </div>
        </div>

        <!-- Emprunts en retard -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center"
              >
                <span class="text-white text-lg">⚠️</span>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-500">En retard</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ loansStore.overdueLoansCount() }}
              </p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-red-600 font-medium"
                >{{ overduePercentage() }}%</span
              >
              <span class="text-gray-500 ml-1">des emprunts actifs</span>
            </div>
          </div>
        </div>

        <!-- Taux d'occupation -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center"
              >
                <span class="text-white text-lg">📊</span>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-500">Taux d'occupation</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ occupationRate() }}%
              </p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-purple-600 font-medium">{{
                borrowedBooks()
              }}</span>
              <span class="text-gray-500 ml-1">livres empruntés</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h3>
          <div class="space-y-3">
            <button
              type="button"
              (click)="onNewLoan()"
              class="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
            >
              <div class="font-medium text-blue-900">Nouvel emprunt</div>
              <div class="text-sm text-blue-700">
                Créer un emprunt pour un membre
              </div>
            </button>
            <button
              type="button"
              (click)="onAddBook()"
              class="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors duration-200"
            >
              <div class="font-medium text-green-900">Ajouter un livre</div>
              <div class="text-sm text-green-700">Enrichir le catalogue</div>
            </button>
            <button
              type="button"
              (click)="onViewOverdueLoans()"
              class="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200"
            >
              <div class="font-medium text-red-900">Emprunts en retard</div>
              <div class="text-sm text-red-700">Gérer les retards</div>
            </button>
          </div>
        </div>

        <!-- Statistiques détaillées -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Activité récente
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Emprunts aujourd'hui</span>
              <span class="text-sm font-medium text-gray-900">{{
                todayLoans()
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Retours aujourd'hui</span>
              <span class="text-sm font-medium text-gray-900">{{
                todayReturns()
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Nouveaux membres</span>
              <span class="text-sm font-medium text-gray-900">0</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Livres ajoutés</span>
              <span class="text-sm font-medium text-gray-900">0</span>
            </div>
          </div>
        </div>

        <!-- État du système -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            État du système
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Base de données</span>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-green-600"
                  >Opérationnelle</span
                >
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">API Mock</span>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Dernière sauvegarde</span>
              <span class="text-sm text-gray-500">Temps réel</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerte si problèmes -->
      <div
        *ngIf="loansStore.overdueLoansCount() > 0"
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div class="flex">
          <div class="text-yellow-600 mr-3">⚠️</div>
          <div>
            <h4 class="text-yellow-800 font-medium">Attention requise</h4>
            <p class="text-yellow-700 text-sm mt-1">
              {{ loansStore.overdueLoansCount() }} emprunt(s) en retard
              nécessitent une action.
              <button
                type="button"
                (click)="onViewOverdueLoans()"
                class="text-yellow-800 underline ml-1 hover:text-yellow-900"
              >
                Voir les détails
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  private refreshInterval?: ReturnType<typeof globalThis.setInterval>;
  readonly catalogStore = inject(CatalogStore);
  readonly loansStore = inject(LoansStore);
  private readonly router = inject(Router);

  readonly descriptionText =
    "Vue d\\'ensemble complète de l\\'activité de la bibliothèque avec toutes les statistiques importantes et les indicateurs de performance pour une gestion optimale";

  ngOnInit(): void {
    // Rafraîchir les données toutes les 15 secondes
    this.refreshInterval = globalThis.setInterval(() => {
      this.catalogStore.refreshBooks();
      this.loansStore.refreshLoans();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      globalThis.clearInterval(this.refreshInterval);
    }
  }

  readonly totalLoans = computed(() => this.loansStore.loans().length);

  readonly borrowedBooks = computed(() => {
    const totalBooks = this.catalogStore.totalBooks();
    const availableBooks = this.catalogStore.totalAvailableBooks();
    return totalBooks - availableBooks;
  });

  readonly occupationRate = computed(() => {
    const totalBooks = this.catalogStore.totalBooks();
    if (totalBooks === 0) {
      return 0;
    }
    const borrowedBooks = this.borrowedBooks();
    return Math.round((borrowedBooks / totalBooks) * 100);
  });

  readonly overduePercentage = computed(() => {
    const activeLoans = this.loansStore.activeLoansCount();
    if (activeLoans === 0) {
      return 0;
    }
    const overdueLoans = this.loansStore.overdueLoansCount();
    return Math.round((overdueLoans / activeLoans) * 100);
  });

  readonly todayLoans = computed(() => {
    const today = new Date().toDateString();
    return this.loansStore.loans().filter(loan => {
      const loanDate = new Date(loan.borrowedAt).toDateString();
      return loanDate === today;
    }).length;
  });

  readonly todayReturns = computed(() => {
    const today = new Date().toDateString();
    return this.loansStore.loans().filter(loan => {
      if (!loan.returnedAt) {
        return false;
      }
      const returnDate = new Date(loan.returnedAt).toDateString();
      return returnDate === today;
    }).length;
  });

  onNewLoan(): void {
    this.router.navigate(['/loans/new']);
  }

  onAddBook(): void {
    this.router.navigate(['/catalog/new']);
  }

  onViewOverdueLoans(): void {
    this.router.navigate(['/loans/all'], {
      queryParams: { filter: 'overdue' },
    });
  }

  onManageMembers(): void {
    this.router.navigate(['/admin/members']);
  }
}
