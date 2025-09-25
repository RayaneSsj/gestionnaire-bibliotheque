import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthStore } from '../../core/auth.store';
import { User, UserRole } from '../../features/auth/data';

import { HasRoleDirective } from './has-role.directive';

@Component({
  template: `
    <div *appHasRole="'admin'" id="admin-content">Admin content</div>
    <div *appHasRole="'librarian'" id="librarian-content">
      Librarian content
    </div>
    <div *appHasRole="'member'" id="member-content">Member content</div>
  `,
  standalone: true,
  imports: [HasRoleDirective],
})
class TestComponent {}

describe('HasRoleDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let mockAuthStore: Partial<AuthStore> & {
    currentUser: WritableSignal<User | null>;
  };

  const createMockUser = (role: UserRole): User => ({
    id: '1',
    email: 'test@test.com',
    displayName: 'Test User',
    role,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  });

  beforeEach(async () => {
    mockAuthStore = {
      currentUser: signal<User | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [TestComponent, HasRoleDirective],
      providers: [{ provide: AuthStore, useValue: mockAuthStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockAuthStore.currentUser.set(null);
      fixture.detectChanges();
    });

    it('should not display any role-protected content', () => {
      expect(fixture.nativeElement.querySelector('#admin-content')).toBeNull();
      expect(
        fixture.nativeElement.querySelector('#librarian-content')
      ).toBeNull();
      expect(fixture.nativeElement.querySelector('#member-content')).toBeNull();
    });
  });

  describe('when user is ADMIN', () => {
    beforeEach(() => {
      const adminUser = createMockUser(UserRole.ADMIN);
      mockAuthStore.currentUser.set(adminUser);
      fixture.detectChanges();
    });

    it('should display admin content', () => {
      expect(
        fixture.nativeElement.querySelector('#admin-content')
      ).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector('#admin-content').textContent.trim()
      ).toBe('Admin content');
    });

    it('should display librarian content (hierarchy)', () => {
      expect(
        fixture.nativeElement.querySelector('#librarian-content')
      ).toBeTruthy();
      expect(
        fixture.nativeElement
          .querySelector('#librarian-content')
          .textContent.trim()
      ).toBe('Librarian content');
    });

    it('should display member content (hierarchy)', () => {
      expect(
        fixture.nativeElement.querySelector('#member-content')
      ).toBeTruthy();
      expect(
        fixture.nativeElement
          .querySelector('#member-content')
          .textContent.trim()
      ).toBe('Member content');
    });
  });

  describe('when user is LIBRARIAN', () => {
    beforeEach(() => {
      const librarianUser = createMockUser(UserRole.LIBRARIAN);
      mockAuthStore.currentUser.set(librarianUser);
      fixture.detectChanges();
    });

    it('should not display admin content', () => {
      expect(fixture.nativeElement.querySelector('#admin-content')).toBeNull();
    });

    it('should display librarian content', () => {
      expect(
        fixture.nativeElement.querySelector('#librarian-content')
      ).toBeTruthy();
      expect(
        fixture.nativeElement
          .querySelector('#librarian-content')
          .textContent.trim()
      ).toBe('Librarian content');
    });

    it('should display member content (hierarchy)', () => {
      expect(
        fixture.nativeElement.querySelector('#member-content')
      ).toBeTruthy();
      expect(
        fixture.nativeElement
          .querySelector('#member-content')
          .textContent.trim()
      ).toBe('Member content');
    });
  });

  describe('when user is MEMBER', () => {
    beforeEach(() => {
      const memberUser = createMockUser(UserRole.MEMBER);
      mockAuthStore.currentUser.set(memberUser);
      fixture.detectChanges();
    });

    it('should not display admin content', () => {
      expect(fixture.nativeElement.querySelector('#admin-content')).toBeNull();
    });

    it('should not display librarian content', () => {
      expect(
        fixture.nativeElement.querySelector('#librarian-content')
      ).toBeNull();
    });

    it('should display member content', () => {
      expect(
        fixture.nativeElement.querySelector('#member-content')
      ).toBeTruthy();
      expect(
        fixture.nativeElement
          .querySelector('#member-content')
          .textContent.trim()
      ).toBe('Member content');
    });
  });
});
