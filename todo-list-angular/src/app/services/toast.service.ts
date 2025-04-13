import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Toast {
  id: number;
  type: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private lastId = 0;

  constructor() {}

  show(type: string, message: string, duration: number = 5000): void {
    const id = ++this.lastId;

    const toast: Toast = {
      id,
      type,
      message,
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    // Auto dismiss after duration
    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}
