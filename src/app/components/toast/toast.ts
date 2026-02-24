import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { LucideAngularModule, Check, X, AlertTriangle, Info } from 'lucide-angular';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
    <div class="fixed top-4 left-4 z-[100] flex flex-col gap-2 max-w-sm" dir="rtl">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm animate-slide-in"
          [class]="getToastClasses(toast.type)">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" [class]="getIconClasses(toast.type)">
            @if (toast.type === 'success') { <lucide-icon [name]="Check" class="size-4 text-white"></lucide-icon> }
            @if (toast.type === 'error') { <lucide-icon [name]="XIcon" class="size-4 text-white"></lucide-icon> }
            @if (toast.type === 'warning') { <lucide-icon [name]="AlertTriangle" class="size-4 text-white"></lucide-icon> }
            @if (toast.type === 'info') { <lucide-icon [name]="InfoIcon" class="size-4 text-white"></lucide-icon> }
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold">{{ toast.title }}</h4>
            <p class="text-xs mt-0.5 opacity-80">{{ toast.message }}</p>
          </div>
          <button (click)="toastService.dismiss(toast.id)" class="text-slate-400 hover:text-slate-600 shrink-0">
            <lucide-icon [name]="XIcon" class="size-4"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in { animation: slide-in 0.3s ease-out; }
  `],
})
export class ToastComponent {
    readonly Check = Check;
    readonly XIcon = X;
    readonly AlertTriangle = AlertTriangle;
    readonly InfoIcon = Info;

    constructor(public toastService: ToastService) { }

    getToastClasses(type: string): string {
        switch (type) {
            case 'success': return 'bg-white border-emerald-200 text-emerald-900';
            case 'error': return 'bg-white border-red-200 text-red-900';
            case 'warning': return 'bg-white border-amber-200 text-amber-900';
            default: return 'bg-white border-blue-200 text-blue-900';
        }
    }

    getIconClasses(type: string): string {
        switch (type) {
            case 'success': return 'bg-emerald-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-amber-500';
            default: return 'bg-blue-500';
        }
    }
}
