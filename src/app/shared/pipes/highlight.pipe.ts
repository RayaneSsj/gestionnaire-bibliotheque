import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined, searchTerm: string | null | undefined): SafeHtml {
    if (!value || !searchTerm) {
      return this.sanitizer.bypassSecurityTrustHtml(value || '');
    }

    // Échapper les caractères spéciaux regex dans le terme de recherche
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Créer la regex avec le flag global et insensible à la casse
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

    // Remplacer les occurrences par une version surlignée
    const highlightedText = value.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');

    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }
}