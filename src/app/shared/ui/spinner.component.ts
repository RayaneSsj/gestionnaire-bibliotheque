import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="loadingService.isLoading()" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      role="progressbar"
      aria-label="Chargement en cours"
    >
      <div class="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <div class="relative">
          <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin-reverse"></div>
        </div>
        <p class="text-gray-700 font-medium">Chargement...</p>
        <div class="text-xs text-gray-500">
          {{ loadingService.requestCount() }} requête(s) en cours
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes spin-reverse {
        from {
          transform: rotate(360deg);
        }
        to {
          transform: rotate(0deg);
        }
      }
      
      .animate-spin-reverse {
        animation: spin-reverse 1s linear infinite;
      }
    `
  ],
})
export class SpinnerComponent {
  readonly loadingService = inject(LoadingService);
}