import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="container">
        <h1 class="logo">
          <a routerLink="/">Gestionnaire Bibliothèque</a>
        </h1>
        <nav class="nav">
          <a routerLink="/catalog" class="nav-link">Catalogue</a>
          <a routerLink="/loans" class="nav-link">Emprunts</a>
          <a routerLink="/admin" class="nav-link">Admin</a>
          <a routerLink="/auth" class="nav-link">Connexion</a>
        </nav>
      </div>
    </header>
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {}
