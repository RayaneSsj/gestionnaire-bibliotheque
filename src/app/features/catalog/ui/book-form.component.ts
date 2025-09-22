import { Component, ChangeDetectionStrategy, input, output, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Book, Author, Category } from '../data';

export interface BookFormData {
  title: string;
  isbn: string;
  authorId: string;
  categoryId: string;
  description: string | undefined;
  publishedDate: string | undefined;
  totalCopies: number;
  language: string | undefined;
  pages: number | undefined;
  publisher: string | undefined;
}

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="bookForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Titre -->
        <div class="md:col-span-2">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Titre <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            formControlName="title"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('title')"
            placeholder="Titre du livre"
          />
          <div *ngIf="isFieldInvalid('title')" class="mt-1 text-sm text-red-600">
            <div *ngIf="bookForm.get('title')?.errors?.['required']">
              Le titre est requis
            </div>
            <div *ngIf="bookForm.get('title')?.errors?.['minlength']">
              Le titre doit contenir au moins 2 caractères
            </div>
          </div>
        </div>

        <!-- ISBN -->
        <div>
          <label for="isbn" class="block text-sm font-medium text-gray-700 mb-1">
            ISBN <span class="text-red-500">*</span>
          </label>
          <input
            id="isbn"
            type="text"
            formControlName="isbn"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('isbn')"
            placeholder="978-2-07-036194-1"
          />
          <div *ngIf="isFieldInvalid('isbn')" class="mt-1 text-sm text-red-600">
            <div *ngIf="bookForm.get('isbn')?.errors?.['required']">
              L'ISBN est requis
            </div>
          </div>
        </div>

        <!-- Nombre d'exemplaires -->
        <div>
          <label for="totalCopies" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'exemplaires <span class="text-red-500">*</span>
          </label>
          <input
            id="totalCopies"
            type="number"
            min="1"
            formControlName="totalCopies"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('totalCopies')"
            placeholder="1"
          />
          <div *ngIf="isFieldInvalid('totalCopies')" class="mt-1 text-sm text-red-600">
            <div *ngIf="bookForm.get('totalCopies')?.errors?.['required']">
              Le nombre d'exemplaires est requis
            </div>
            <div *ngIf="bookForm.get('totalCopies')?.errors?.['min']">
              Le nombre d'exemplaires doit être au moins 1
            </div>
          </div>
        </div>

        <!-- Auteur -->
        <div>
          <label for="authorId" class="block text-sm font-medium text-gray-700 mb-1">
            Auteur <span class="text-red-500">*</span>
          </label>
          <select
            id="authorId"
            formControlName="authorId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('authorId')"
          >
            <option value="">Sélectionner un auteur</option>
            <option *ngFor="let author of authors()" [value]="author.id">
              {{ author.firstName }} {{ author.lastName }}
            </option>
          </select>
          <div *ngIf="isFieldInvalid('authorId')" class="mt-1 text-sm text-red-600">
            <div *ngIf="bookForm.get('authorId')?.errors?.['required']">
              L'auteur est requis
            </div>
          </div>
        </div>

        <!-- Catégorie -->
        <div>
          <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">
            Catégorie <span class="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            formControlName="categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('categoryId')"
          >
            <option value="">Sélectionner une catégorie</option>
            <option *ngFor="let category of categories()" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
          <div *ngIf="isFieldInvalid('categoryId')" class="mt-1 text-sm text-red-600">
            <div *ngIf="bookForm.get('categoryId')?.errors?.['required']">
              La catégorie est requise
            </div>
          </div>
        </div>

        <!-- Date de publication -->
        <div>
          <label for="publishedDate" class="block text-sm font-medium text-gray-700 mb-1">
            Date de publication
          </label>
          <input
            id="publishedDate"
            type="date"
            formControlName="publishedDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Langue -->
        <div>
          <label for="language" class="block text-sm font-medium text-gray-700 mb-1">
            Langue
          </label>
          <input
            id="language"
            type="text"
            formControlName="language"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Français"
          />
        </div>

        <!-- Nombre de pages -->
        <div>
          <label for="pages" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre de pages
          </label>
          <input
            id="pages"
            type="number"
            min="1"
            formControlName="pages"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="320"
          />
        </div>

        <!-- Éditeur -->
        <div>
          <label for="publisher" class="block text-sm font-medium text-gray-700 mb-1">
            Éditeur
          </label>
          <input
            id="publisher"
            type="text"
            formControlName="publisher"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Gallimard"
          />
        </div>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows="4"
          formControlName="description"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Description du livre..."
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          (click)="onCancel()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          [disabled]="bookForm.invalid || isSubmitting()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting() ? 'Enregistrement...' : submitButtonText() }}
        </button>
      </div>
    </form>
  `,
  styles: [],
})
export class BookFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly initialData = input<Partial<Book>>();
  readonly authors = input.required<Author[]>();
  readonly categories = input.required<Category[]>();
  readonly isSubmitting = input(false);
  readonly submitButtonText = input('Enregistrer');

  readonly formSubmit = output<BookFormData>();
  readonly cancel = output<void>();

  readonly bookForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    isbn: ['', [Validators.required]],
    authorId: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    description: [''],
    publishedDate: [''],
    totalCopies: [1, [Validators.required, Validators.min(1)]],
    language: [''],
    pages: [null as number | null, [Validators.min(1)]],
    publisher: [''],
  });

  readonly isFormValid = computed(() => this.bookForm.valid);

  constructor() {
    // Effect pour initialiser le formulaire avec les données existantes
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.bookForm.patchValue({
          title: data.title || '',
          isbn: data.isbn || '',
          authorId: data.authorId || '',
          categoryId: data.categoryId || '',
          description: data.description || '',
          publishedDate: data.publishedDate || '',
          totalCopies: data.totalCopies || 1,
          language: data.language || '',
          pages: data.pages || null,
          publisher: data.publisher || '',
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      const bookData: BookFormData = {
        title: formValue.title!,
        isbn: formValue.isbn!,
        authorId: formValue.authorId!,
        categoryId: formValue.categoryId!,
        description: formValue.description || undefined,
        publishedDate: formValue.publishedDate || undefined,
        totalCopies: formValue.totalCopies!,
        language: formValue.language || undefined,
        pages: formValue.pages || undefined,
        publisher: formValue.publisher || undefined,
      };
      
      this.formSubmit.emit(bookData);
    } else {
      this.bookForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}