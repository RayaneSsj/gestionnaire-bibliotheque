import { Component } from '@angular/core';

@Component({
  selector: 'app-catalog',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Catalogue des livres</h1>
      <p>Catalogue de la bibliothèque - En cours de développement</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class CatalogPage {}