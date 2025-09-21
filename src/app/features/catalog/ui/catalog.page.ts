import { Component } from '@angular/core';

@Component({
  selector: 'app-catalog',
  standalone: true,
  template: `
    <div class="container py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Catalogue des livres</h1>
      <p class="text-gray-600">Catalogue de la bibliothèque - En cours de développement</p>
    </div>
  `,
  styles: []
})
export class CatalogPage {}