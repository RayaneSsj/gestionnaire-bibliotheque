import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal, inject } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

import { UserRole } from '../auth/data';

import { Member } from './data';

@Injectable({
  providedIn: 'root',
})
export class AdminStore {
  private readonly http = inject(HttpClient);

  // Signals privés
  private readonly _members = signal<Member[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Signals publics en lecture seule
  readonly members = this._members.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed - statistiques membres
  readonly totalMembers = computed(() => this._members().length);
  readonly activeMembers = computed(() =>
    this._members().filter(member => member.isActive).length
  );
  readonly adminCount = computed(() =>
    this._members().filter(member => member.role === UserRole.ADMIN).length
  );
  readonly memberCount = computed(() =>
    this._members().filter(member => member.role === UserRole.MEMBER).length
  );

  constructor() {
    this.loadMembers();
  }

  // Charger tous les membres
  loadMembers(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<Member[]>('/api/members').pipe(
      tap(members => {
        this._members.set(members);
      }),
      catchError(error => {
        this._error.set(error.error?.message || 'Erreur lors du chargement des membres');
        return of([]);
      })
    ).subscribe(() => {
      this._isLoading.set(false);
    });
  }

  // Mettre à jour le rôle d'un membre
  updateMemberRole(memberId: string, role: UserRole): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.put<Member>(`/api/members/${memberId}`, { role }).pipe(
      tap(updatedMember => {
        this._members.update(members =>
          members.map(member =>
            member.id === memberId ? updatedMember : member
          )
        );
      }),
      catchError(error => {
        this._error.set(error.error?.message || 'Erreur lors de la mise à jour du membre');
        return of(null);
      })
    ).subscribe(() => {
      this._isLoading.set(false);
    });
  }

  // Activer/désactiver un membre
  toggleMemberStatus(memberId: string): void {
    const member = this._members().find(m => m.id === memberId);
    if (!member) {return;}

    this._isLoading.set(true);
    this._error.set(null);

    const newStatus = !member.isActive;

    this.http.put<Member>(`/api/members/${memberId}`, { isActive: newStatus }).pipe(
      tap(updatedMember => {
        this._members.update(members =>
          members.map(m =>
            m.id === memberId ? updatedMember : m
          )
        );
      }),
      catchError(error => {
        this._error.set(error.error?.message || 'Erreur lors de la modification du statut');
        return of(null);
      })
    ).subscribe(() => {
      this._isLoading.set(false);
    });
  }

  // Obtenir un membre par ID
  getMemberById(memberId: string): Member | undefined {
    return this._members().find(member => member.id === memberId);
  }

  // Rafraîchir la liste des membres
  refreshMembers(): void {
    this.loadMembers();
  }
}