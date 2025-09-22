import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserRole } from '../../auth/data';
import { AdminStore } from '../admin.store';
import { Member } from '../data';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <button
              type="button"
              (click)="goBack()"
              class="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              ← Retour
            </button>
            <h1 class="text-3xl font-bold text-gray-900">Gestion des membres</h1>
          </div>
          <button
            type="button"
            (click)="refreshMembers()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Actualiser
          </button>
        </div>
        <p class="text-gray-600">Gérer les rôles et statuts des membres de la bibliothèque</p>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="text-2xl font-bold text-blue-600">{{ adminStore.totalMembers() }}</div>
          <div class="text-sm text-gray-600">Total membres</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="text-2xl font-bold text-green-600">{{ adminStore.activeMembers() }}</div>
          <div class="text-sm text-gray-600">Membres actifs</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="text-2xl font-bold text-purple-600">{{ adminStore.adminCount() }}</div>
          <div class="text-sm text-gray-600">Administrateurs</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="text-2xl font-bold text-orange-600">{{ adminStore.memberCount() }}</div>
          <div class="text-sm text-gray-600">Utilisateurs</div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Recherche -->
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              id="search"
              type="text"
              [(ngModel)]="searchQuery"
              (input)="updateFilters()"
              placeholder="Nom, email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Filtre par rôle -->
          <div>
            <label for="roleFilter" class="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              id="roleFilter"
              [(ngModel)]="roleFilter"
              (change)="updateFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="member">Membres</option>
            </select>
          </div>

          <!-- Filtre par statut -->
          <div>
            <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">
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
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t">
          <button
            *ngIf="hasActiveFilters()"
            type="button"
            (click)="clearFilters()"
            class="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Effacer tous les filtres
          </button>
        </div>
      </div>

      <!-- Messages d'erreur -->
      <div *ngIf="adminStore.error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="text-red-600 mr-3">⚠️</div>
          <div class="text-red-800">{{ adminStore.error() }}</div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="adminStore.isLoading()" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Liste des membres -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emprunts
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrit le
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                *ngFor="let member of filteredMembers(); trackBy: trackByMemberId"
                class="hover:bg-gray-50 transition-colors duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ member.displayName.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ member.displayName }}</div>
                      <div class="text-sm text-gray-500">{{ member.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    [value]="member.role"
                    (change)="onRoleChange(member, $event)"
                    [disabled]="adminStore.isLoading()"
                    class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="member">Membre</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(member)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusLabel(member) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ member.borrowedBooksCount || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(member.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button
                    (click)="toggleMemberStatus(member)"
                    [disabled]="adminStore.isLoading()"
                    [class]="member.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                    class="font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ member.isActive ? 'Désactiver' : 'Activer' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="filteredMembers().length === 0 && !adminStore.isLoading()" class="text-center py-12">
        <div class="text-6xl mb-4">👥</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun membre trouvé</h3>
        <p class="text-gray-600">Essayez de modifier vos critères de recherche.</p>
      </div>
    </div>
  `,
})
export class MembersPage {
  readonly adminStore = inject(AdminStore);
  private readonly router = inject(Router);

  // Filtres
  searchQuery = signal('');
  roleFilter = signal<string>('');
  statusFilter = signal<string>('');

  readonly filteredMembers = computed(() => {
    let members = this.adminStore.members();

    // Filtre par recherche
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      members = members.filter(member =>
        member.displayName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    }

    // Filtre par rôle
    const role = this.roleFilter();
    if (role) {
      members = members.filter(member => member.role === role);
    }

    // Filtre par statut
    const status = this.statusFilter();
    if (status) {
      if (status === 'active') {
        members = members.filter(member => member.isActive);
      } else if (status === 'inactive') {
        members = members.filter(member => !member.isActive);
      }
    }

    return members.sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  readonly hasActiveFilters = computed(() => {
    return !!(this.searchQuery() || this.roleFilter() || this.statusFilter());
  });

  updateFilters(): void {
    // Les computed se mettront à jour automatiquement
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
  }

  onRoleChange(member: Member, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value as UserRole;

    if (newRole !== member.role) {
      this.adminStore.updateMemberRole(member.id, newRole);
    }
  }

  toggleMemberStatus(member: Member): void {
    this.adminStore.toggleMemberStatus(member.id);
  }

  refreshMembers(): void {
    this.adminStore.refreshMembers();
  }

  getStatusClass(member: Member): string {
    return member.isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getStatusLabel(member: Member): string {
    return member.isActive ? 'Actif' : 'Inactif';
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }

  trackByMemberId(_index: number, member: Member): string {
    return member.id;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}