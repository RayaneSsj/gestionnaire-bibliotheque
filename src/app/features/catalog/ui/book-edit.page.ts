import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, inject, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { CatalogStore } from "../catalog.store";

import { BookFormComponent, BookFormData } from "./book-form.component";

@Component({
  selector: "app-book-edit",
  standalone: true,
  imports: [CommonModule, BookFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Modifier le livre</h1>
        
        <div *ngIf="book()" class="bg-white rounded-lg shadow-lg p-8">
          <app-book-form
            [initialData]="book()"
            [authors]="catalogStore.authors()"
            [categories]="catalogStore.categories()"
            [isSubmitting]="catalogStore.isLoading()"
            submitButtonText="Mettre à jour"
            (formSubmit)="onSubmit($event)"
            (cancel)="onCancel()"
          />
        </div>

        <div *ngIf="!book()" class="text-center py-12">
          <p class="text-gray-500">Livre non trouvé.</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class BookEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly catalogStore = inject(CatalogStore);

  readonly book = computed(() => {
    const bookId = this.route.snapshot.paramMap.get("id");
    return bookId ? this.catalogStore.getBookById(bookId) : undefined;
  });

  onSubmit(formData: BookFormData): void {
    const bookData = this.book();
    if (bookData) {
      // Ne pas inclure availableCopies - laissons l'intercepteur le calculer automatiquement
      // basé sur la différence entre ancien et nouveau totalCopies
      this.catalogStore.updateBook(bookData.id, formData);
      this.router.navigate(["/catalog", bookData.id]);
    }
  }

  onCancel(): void {
    const bookData = this.book();
    if (bookData) {
      this.router.navigate(["/catalog", bookData.id]);
    } else {
      this.router.navigate(["/catalog"]);
    }
  }
}
