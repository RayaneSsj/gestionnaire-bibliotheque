import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts$ = this.toasts.asReadonly();

  show(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${this.nextId++}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, duration?: number): string {
    const toast: Partial<Toast> & Pick<Toast, 'type' | 'title'> = {
      type: 'success',
      title,
    };
    if (message !== undefined) {toast.message = message;}
    if (duration !== undefined) {toast.duration = duration;}
    return this.show(toast as Omit<Toast, 'id'>);
  }

  error(title: string, message?: string, duration?: number): string {
    const toast: Partial<Toast> & Pick<Toast, 'type' | 'title'> = {
      type: 'error',
      title,
      duration: duration ?? 8000
    };
    if (message !== undefined) {toast.message = message;}
    return this.show(toast as Omit<Toast, 'id'>);
  }

  warning(title: string, message?: string, duration?: number): string {
    const toast: Partial<Toast> & Pick<Toast, 'type' | 'title'> = {
      type: 'warning',
      title,
    };
    if (message !== undefined) {toast.message = message;}
    if (duration !== undefined) {toast.duration = duration;}
    return this.show(toast as Omit<Toast, 'id'>);
  }

  info(title: string, message?: string, duration?: number): string {
    const toast: Partial<Toast> & Pick<Toast, 'type' | 'title'> = {
      type: 'info',
      title,
    };
    if (message !== undefined) {toast.message = message;}
    if (duration !== undefined) {toast.duration = duration;}
    return this.show(toast as Omit<Toast, 'id'>);
  }

  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}