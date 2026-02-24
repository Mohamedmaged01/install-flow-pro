import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private counter = 0;
    readonly toasts = signal<Toast[]>([]);

    show(title: string, message: string, type: Toast['type'] = 'info', duration = 4000): void {
        const id = ++this.counter;
        const toast: Toast = { id, title, message, type, duration };
        this.toasts.update(t => [...t, toast]);

        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
    }

    success(title: string, message: string): void {
        this.show(title, message, 'success');
    }

    error(title: string, message: string): void {
        this.show(title, message, 'error', 6000);
    }

    warning(title: string, message: string): void {
        this.show(title, message, 'warning');
    }

    info(title: string, message: string): void {
        this.show(title, message, 'info');
    }

    dismiss(id: number): void {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
    }
}
