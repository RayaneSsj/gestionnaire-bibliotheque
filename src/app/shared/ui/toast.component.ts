import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { Toast, ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed top-4 right-4 z-50 space-y-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div
        *ngFor="let toast of toastService.toasts$(); trackBy: trackByToastId"
        [class]="getToastClasses(toast)"
        role="alert"
        [attr.aria-labelledby]="toast.id + '-title'"
        [attr.aria-describedby]="toast.message ? toast.id + '-message' : null"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0" [innerHTML]="getIcon(toast.type)" aria-hidden="true"></div>

          <div class="ml-3 flex-1">
            <p [id]="toast.id + '-title'" class="text-sm font-medium" [class]="getTitleClasses(toast.type)">
              {{ toast.title }}
            </p>
            <p
              *ngIf="toast.message"
              [id]="toast.id + '-message'"
              class="mt-1 text-sm"
              [class]="getMessageClasses(toast.type)"
            >
              {{ toast.message }}
            </p>
            <div *ngIf="toast.actions && toast.actions.length > 0" class="mt-2 flex space-x-2">
              <button
                *ngFor="let action of toast.actions; trackBy: trackByActionLabel"
                type="button"
                (click)="action.action()"
                class="text-xs font-medium underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
                [class]="getActionClasses(toast.type)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              (click)="toastService.dismiss(toast.id)"
              class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              [class]="getCloseButtonClasses(toast.type)"
              [attr.aria-label]="'Fermer la notification: ' + toast.title"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  getToastClasses(toast: Toast): string {
    const baseClasses = 'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out';

    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-50 ring-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 ring-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 ring-yellow-200`;
      case 'info':
        return `${baseClasses} bg-blue-50 ring-blue-200`;
      default:
        return `${baseClasses} bg-gray-50 ring-gray-200`;
    }
  }

  getTitleClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  }

  getMessageClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  }

  getActionClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-600 hover:text-green-500 focus:ring-green-500';
      case 'error':
        return 'text-red-600 hover:text-red-500 focus:ring-red-500';
      case 'warning':
        return 'text-yellow-600 hover:text-yellow-500 focus:ring-yellow-500';
      case 'info':
        return 'text-blue-600 hover:text-blue-500 focus:ring-blue-500';
      default:
        return 'text-gray-600 hover:text-gray-500 focus:ring-gray-500';
    }
  }

  getCloseButtonClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-400 hover:text-green-500 focus:ring-green-500';
      case 'error':
        return 'text-red-400 hover:text-red-500 focus:ring-red-500';
      case 'warning':
        return 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500';
      case 'info':
        return 'text-blue-400 hover:text-blue-500 focus:ring-blue-500';
      default:
        return 'text-gray-400 hover:text-gray-500 focus:ring-gray-500';
    }
  }

  trackByToastId(_index: number, toast: Toast): string {
    return toast.id;
  }

  trackByActionLabel(_index: number, action: { label: string; action: () => void }): string {
    return action.label;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return `<svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      case 'error':
        return `<svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>`;
      case 'warning':
        return `<svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>`;
      case 'info':
        return `<svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      default:
        return `<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    }
  }
}