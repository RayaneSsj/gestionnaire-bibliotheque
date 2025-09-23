import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FocusManagementService {

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  focusOnMainHeading(): void {
    setTimeout(() => {
      const mainHeading = this.document.querySelector('h1');
      if (mainHeading) {
        mainHeading.setAttribute('tabindex', '-1');
        mainHeading.focus();

        mainHeading.addEventListener('blur', () => {
          mainHeading.removeAttribute('tabindex');
        }, { once: true });
      }
    }, 100);
  }

  focusOnElement(selector: string): void {
    setTimeout(() => {
      const element = this.document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
      }
    }, 100);
  }

  announceToScreenReader(message: string): void {
    const announcement = this.document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    this.document.body.appendChild(announcement);

    setTimeout(() => {
      this.document.body.removeChild(announcement);
    }, 1000);
  }
}