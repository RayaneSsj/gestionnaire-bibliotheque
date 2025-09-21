import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Authentification</h1>
      <p>Page d'authentification - En cours de développement</p>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        color: #333;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class AuthPage {}
