import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _requestCount = signal(0);

  readonly requestCount = this._requestCount.asReadonly();
  readonly isLoading = computed(() => this._requestCount() > 0);

  incrementRequests(): void {
    this._requestCount.update(count => count + 1);
  }

  decrementRequests(): void {
    this._requestCount.update(count => Math.max(0, count - 1));
  }

  reset(): void {
    this._requestCount.set(0);
  }

  getDebugInfo(): { requestCount: number; isLoading: boolean } {
    return {
      requestCount: this._requestCount(),
      isLoading: this.isLoading(),
    };
  }
}