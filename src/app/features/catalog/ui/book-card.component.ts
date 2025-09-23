import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { BookWithDetails } from '../catalog.store';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, TruncatePipe, HighlightPipe, HasRoleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div class="aspect-w-3 aspect-h-4 bg-gray-200">
        <div class="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <svg class="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
      </div>
      
      <div class="p-4">
        <div class="mb-2">
          <h3 class="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">
            <!-- Utilisation du pipe highlight pour surligner le terme de recherche -->
            <span [innerHTML]="book().title | highlight : searchTerm()"></span>
          </h3>
          <p class="text-sm text-gray-600 mb-2">
            par {{ book().author ? book().author!.firstName + ' ' + book().author!.lastName : 'Auteur inconnu' }}
          </p>
          <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {{ book().category?.name || 'Non catégorisé' }}
          </span>

          <!-- Utilisation du pipe truncate pour afficher une description courte -->
          <p *ngIf="book().description" class="text-xs text-gray-500 mt-2 leading-relaxed">
            {{ book().description | truncate : 80 : '...' }}
          </p>
        </div>

        <div class="mb-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Disponibilité :</span>
            <div class="flex items-center space-x-1">
              <span [class]="availabilityClass()">
                {{ book().availableCopies }} / {{ book().totalCopies }}
              </span>
              <div [class]="statusIndicatorClass()" class="w-2 h-2 rounded-full"></div>
            </div>
          </div>
          
          <div *ngIf="book().isbn" class="text-xs text-gray-500 mt-1">
            ISBN: {{ book().isbn }}
          </div>
        </div>

        <div class="flex flex-col space-y-2">
          <button
            type="button"
            (click)="onViewDetails()"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Voir les détails
          </button>
          
          <div class="flex space-x-2">
            <button
              *ngIf="showBorrowButton()"
              type="button"
              (click)="onBorrow()"
              [disabled]="!canBorrow()"
              [class]="borrowButtonClass()"
            >
              {{ borrowButtonText() }}
            </button>
            
            <!-- Utilisation de la directive hasRole -->
            <button
              *appHasRole="'admin'"
              type="button"
              (click)="onEdit()"
              class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `
  ],
})
export class BookCardComponent {
  readonly book = input.required<BookWithDetails>();
  readonly showBorrowButton = input(false);
  readonly showEditButton = input(false);
  readonly canBorrowBook = input(true);
  readonly searchTerm = input<string>('');

  readonly viewDetails = output<string>();
  readonly borrow = output<string>();
  readonly edit = output<string>();

  availabilityClass(): string {
    const available = this.book().availableCopies;
    const total = this.book().totalCopies;
    
    if (available === 0) {
      return 'text-red-600 font-medium';
    } else if (available <= total * 0.3) {
      return 'text-orange-600 font-medium';
    }
    return 'text-green-600 font-medium';
  }

  statusIndicatorClass(): string {
    const available = this.book().availableCopies;
    const total = this.book().totalCopies;
    
    if (available === 0) {
      return 'bg-red-500';
    } else if (available <= total * 0.3) {
      return 'bg-orange-500';
    }
    return 'bg-green-500';
  }

  canBorrow(): boolean {
    return this.book().availableCopies > 0 && this.canBorrowBook();
  }

  borrowButtonText(): string {
    if (this.book().availableCopies === 0) {
      return 'Non disponible';
    }
    if (!this.canBorrowBook()) {
      return 'Limite atteinte';
    }
    return 'Emprunter';
  }

  borrowButtonClass(): string {
    const baseClasses = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200';
    
    if (!this.canBorrow()) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.book().id);
  }

  onBorrow(): void {
    if (this.canBorrow()) {
      this.borrow.emit(this.book().id);
    }
  }

  onEdit(): void {
    this.edit.emit(this.book().id);
  }
}