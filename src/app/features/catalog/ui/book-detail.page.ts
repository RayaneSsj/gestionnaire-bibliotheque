import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, inject, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { AuthStore } from "../../../core";
import { CatalogStore } from "../catalog.store";

@Component({
  selector: "app-book-detail",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8">
      <div *ngIf="book()" class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            <\!-- Image placeholder -->
            <div class="md:col-span-1">
              <div class="aspect-w-3 aspect-h-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <svg class="w-24 h-24 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
            </div>

            <\!-- Book details -->
            <div class="md:col-span-2 space-y-6">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ book()?.title }}</h1>
                <p class="text-xl text-gray-600 mb-4">
                  par {{ book()?.author ? book()\!.author\!.firstName + " " + book()\!.author\!.lastName : "Auteur inconnu" }}
                </p>
                <span class="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ book()?.category?.name || "Non catégorisé" }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 py-4 border-t border-b">
                <div>
                  <span class="text-sm text-gray-500">Disponibilité</span>
                  <p class="font-medium">{{ book()?.availableCopies }} / {{ book()?.totalCopies }} exemplaires</p>
                </div>
                <div *ngIf="book()?.isbn">
                  <span class="text-sm text-gray-500">ISBN</span>
                  <p class="font-medium">{{ book()?.isbn }}</p>
                </div>
              </div>

              <div *ngIf="book()?.description" class="space-y-2">
                <h3 class="font-semibold text-gray-900">Description</h3>
                <p class="text-gray-700 leading-relaxed">{{ book()?.description }}</p>
              </div>

              <div class="flex space-x-4">
                <button
                  *ngIf="authStore.isAuthenticated() && \!authStore.isAdmin() && canBorrow()"
                  type="button"
                  (click)="onBorrow()"
                  class="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Emprunter ce livre
                </button>
                
                <button
                  *ngIf="authStore.isAdmin()"
                  type="button"
                  (click)="onEdit()"
                  class="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Modifier
                </button>
                
                <button
                  type="button"
                  (click)="onBack()"
                  class="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Retour au catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="\!book()" class="text-center py-12">
        <p class="text-gray-500">Livre non trouvé.</p>
      </div>
    </div>
  `,
  styles: [],
})
export class BookDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly catalogStore = inject(CatalogStore);
  readonly authStore = inject(AuthStore);

  readonly book = computed(() => {
    const bookId = this.route.snapshot.paramMap.get("id");
    return bookId ? this.catalogStore.getBookById(bookId) : undefined;
  });

  canBorrow(): boolean {
    const bookData = this.book();
    return !!(bookData && bookData.availableCopies > 0);
  }

  onBorrow(): void {
    const bookData = this.book();
    if (bookData) {
      console.log("Emprunter le livre:", bookData.id);
    }
  }

  onEdit(): void {
    const bookData = this.book();
    if (bookData) {
      this.router.navigate(["/catalog", bookData.id, "edit"]);
    }
  }

  onBack(): void {
    this.router.navigate(["/catalog"]);
  }
}
