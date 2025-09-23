import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

import { AuthStore } from '../../core/auth.store';
import { UserRole } from '../../features/auth/data';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly authStore = inject(AuthStore);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private requiredRole: UserRole | string | null = null;

  @Input() set appHasRole(role: UserRole | string | null) {
    this.requiredRole = role;
    this.updateView();
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (this.hasRequiredRole()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private hasRequiredRole(): boolean {
    const currentUser = this.authStore.currentUser();

    if (!currentUser || !this.requiredRole) {
      return false;
    }

    // Support pour les strings et les enums UserRole
    const roleToCheck = typeof this.requiredRole === 'string'
      ? this.requiredRole.toLowerCase()
      : this.requiredRole;

    const userRole = currentUser.role.toLowerCase();

    // Vérifier si l'utilisateur a le rôle exact demandé
    if (userRole === roleToCheck) {
      return true;
    }

    // Hiérarchie des rôles : admin > librarian > member
    if (roleToCheck === 'member' || roleToCheck === UserRole.MEMBER) {
      return userRole === 'admin' || userRole === 'librarian' || userRole === 'member';
    }

    if (roleToCheck === 'librarian' || roleToCheck === UserRole.LIBRARIAN) {
      return userRole === 'admin' || userRole === 'librarian';
    }

    if (roleToCheck === 'admin' || roleToCheck === UserRole.ADMIN) {
      return userRole === 'admin';
    }

    return false;
  }
}