import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FocusManagementService {

  constructor(@Inject(DOCUMENT) private readonly doc: Document) {}

  focusOnMainHeading(): void {
    setTimeout(() => {
      const mainHeading = this.doc.querySelector('h1');
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
      const element = this.doc.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
      }
    }, 100);
  }

  announceToScreenReader(message: string): void {
    const announcement = this.doc.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    this.doc.body.appendChild(announcement);

    setTimeout(() => {
      this.doc.body.removeChild(announcement);
    }, 1000);
  }
}