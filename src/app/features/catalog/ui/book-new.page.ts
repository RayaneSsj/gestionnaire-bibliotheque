import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

import { CatalogStore } from "../catalog.store";
import { BookFormComponent, BookFormData } from "./book-form.component";

@Component({
  selector: "app-book-new",
  standalone: true,
  imports: [CommonModule, BookFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Ajouter un nouveau livre</h1>
        
        <div class="bg-white rounded-lg shadow-lg p-8">
          <app-book-form
            [authors]="catalogStore.authors()"
            [categories]="catalogStore.categories()"
            [isSubmitting]="catalogStore.isLoading()"
            submitButtonText="Créer le livre"
            (formSubmit)="onSubmit($event)"
            (cancel)="onCancel()"
          />
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class BookNewPage {
  private readonly router = inject(Router);
  readonly catalogStore = inject(CatalogStore);

  onSubmit(formData: BookFormData): void {
    this.catalogStore.createBook({
      ...formData,
      availableCopies: formData.totalCopies,
    });
    this.router.navigate(["/catalog"]);
  }

  onCancel(): void {
    this.router.navigate(["/catalog"]);
  }
}
