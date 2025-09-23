import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found-container">
      <div class="content">
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous recherchez n'existe pas.</p>
        <a routerLink="/" class="home-link">Retour à l'accueil</a>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        text-align: center;
        padding: 2rem;
      }

      .content {
        max-width: 500px;
      }

      h1 {
        font-size: 6rem;
        font-weight: bold;
        margin: 0;
        color: #dc3545;
      }

      h2 {
        font-size: 2rem;
        margin: 1rem 0;
        color: #333;
      }

      p {
        font-size: 1.2rem;
        margin: 1.5rem 0;
        color: #666;
      }

      .home-link {
        display: inline-block;
        padding: 0.8rem 2rem;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      .home-link:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class NotFoundPage {}
