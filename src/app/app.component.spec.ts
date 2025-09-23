import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { AuthStore } from './core/auth.store';

describe('AppComponent', () => {
  let mockAuthStore: any;

  beforeEach(async () => {
    mockAuthStore = {
      isAuthenticated: signal(false),
      isAdmin: signal(false),
      currentUser: signal(null),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the skip link', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink?.textContent?.trim()).toBe('Aller au contenu principal');
  });

  it('should render the main header', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('header[role="banner"]');
    expect(header).toBeTruthy();
  });

  it('should render the main content area', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const main = compiled.querySelector('main[role="main"]');
    expect(main).toBeTruthy();
    expect(main?.id).toBe('main-content');
  });
});