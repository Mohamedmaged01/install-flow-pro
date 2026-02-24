import { Component, Input } from '@angular/core';
import { ApiOrderStatus } from '../../models/api-models';

const STATUS_LABEL_MAP: Record<ApiOrderStatus, string> = {
    [ApiOrderStatus.Draft]: 'مسودة',
    [ApiOrderStatus.PendingSalesManager]: 'بانتظار مدير المبيعات',
    [ApiOrderStatus.PendingSupervisor]: 'بانتظار المشرف',
    [ApiOrderStatus.InProgress]: 'قيد التنفيذ',
    [ApiOrderStatus.Completed]: 'مكتمل',
    [ApiOrderStatus.Returned]: 'مُعاد',
    [ApiOrderStatus.Cancelled]: 'ملغي',
};

const STATUS_COLOR_MAP: Record<ApiOrderStatus, { bg: string; text: string; border: string }> = {
    [ApiOrderStatus.Draft]: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    [ApiOrderStatus.PendingSalesManager]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    [ApiOrderStatus.PendingSupervisor]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    [ApiOrderStatus.InProgress]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    [ApiOrderStatus.Completed]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    [ApiOrderStatus.Returned]: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    [ApiOrderStatus.Cancelled]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

@Component({
    selector: 'app-status-badge',
    standalone: true,
    template: `
    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border"
      [class]="colors.bg + ' ' + colors.text + ' ' + colors.border">
      {{ label }}
    </span>
  `,
})
export class StatusBadge {
    @Input() status!: ApiOrderStatus;

    get label(): string {
        return STATUS_LABEL_MAP[this.status] ?? this.status;
    }

    get colors(): { bg: string; text: string; border: string } {
        return STATUS_COLOR_MAP[this.status] ?? { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    }
}
