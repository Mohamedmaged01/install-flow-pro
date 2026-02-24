import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { ApiOrder, ApiOrderStatus } from '../../../models/api-models';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [],
  templateUrl: './recent-orders.html',
  styles: ``,
})
export class RecentOrders implements OnInit {
  orders: ApiOrder[] = [];
  isLoading = false;

  readonly statusLabels: Record<ApiOrderStatus, string> = {
    [ApiOrderStatus.Draft]: 'مسودة',
    [ApiOrderStatus.PendingSalesManager]: 'بانتظار مدير المبيعات',
    [ApiOrderStatus.PendingSupervisor]: 'بانتظار المشرف',
    [ApiOrderStatus.InProgress]: 'قيد التنفيذ',
    [ApiOrderStatus.Completed]: 'مكتمل',
    [ApiOrderStatus.Returned]: 'مُعاد',
    [ApiOrderStatus.Cancelled]: 'ملغي',
  };

  readonly statusColors: Record<ApiOrderStatus, { bg: string; text: string }> = {
    [ApiOrderStatus.Draft]: { bg: 'bg-slate-50', text: 'text-slate-600' },
    [ApiOrderStatus.PendingSalesManager]: { bg: 'bg-amber-50', text: 'text-amber-700' },
    [ApiOrderStatus.PendingSupervisor]: { bg: 'bg-purple-50', text: 'text-purple-700' },
    [ApiOrderStatus.InProgress]: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    [ApiOrderStatus.Completed]: { bg: 'bg-teal-50', text: 'text-teal-700' },
    [ApiOrderStatus.Returned]: { bg: 'bg-rose-50', text: 'text-rose-700' },
    [ApiOrderStatus.Cancelled]: { bg: 'bg-red-50', text: 'text-red-700' },
  };

  constructor(private ordersService: OrdersService, private router: Router) { }

  ngOnInit() {
    this.isLoading = true;
    this.ordersService.getAll().subscribe({
      next: (orders) => {
        this.orders = orders.slice(0, 5);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  getStatusLabel(status: ApiOrderStatus): string {
    return this.statusLabels[status] ?? status;
  }

  getStatusColor(status: ApiOrderStatus): { bg: string; text: string } {
    return this.statusColors[status] ?? { bg: 'bg-slate-50', text: 'text-slate-600' };
  }

  viewOrder(id: number) {
    this.router.navigate(['/orders', id]);
  }

  viewAll() {
    this.router.navigate(['/jobs']);
  }
}

