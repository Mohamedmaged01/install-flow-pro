import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrdersService } from '../../services/orders.service';
import { ApiOrder, ApiOrderStatus } from '../../models/api-models';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { LucideAngularModule, Search, Filter, Eye, FileText, RefreshCw } from 'lucide-angular';

const STATUS_LABEL_MAP: Record<ApiOrderStatus, string> = {
    [ApiOrderStatus.Draft]: 'مسودة',
    [ApiOrderStatus.PendingSalesManager]: 'بانتظار مدير المبيعات',
    [ApiOrderStatus.PendingSupervisor]: 'بانتظار المشرف',
    [ApiOrderStatus.InProgress]: 'قيد التنفيذ',
    [ApiOrderStatus.Completed]: 'مكتمل',
    [ApiOrderStatus.Returned]: 'مُعاد',
    [ApiOrderStatus.Cancelled]: 'ملغي',
};

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [LucideAngularModule, StatusBadge],
    templateUrl: './orders.html',
})
export class Orders implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly Eye = Eye;
    readonly FileText = FileText;
    readonly RefreshCw = RefreshCw;
    readonly ApiOrderStatus = ApiOrderStatus;
    readonly STATUS_LABEL_MAP = STATUS_LABEL_MAP;

    statusFilter: ApiOrderStatus | 'all' = 'all';
    searchQuery = '';
    allOrders: ApiOrder[] = [];
    isLoading = false;

    constructor(
        public auth: AuthService,
        private ordersApi: OrdersService,
        private router: Router,
    ) { }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        this.ordersApi.getAll().subscribe({
            next: (orders) => {
                this.allOrders = orders;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    get filteredOrders(): ApiOrder[] {
        let orders = this.allOrders;
        if (this.statusFilter !== 'all') {
            orders = orders.filter(o => o.status === this.statusFilter);
        }
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.trim().toLowerCase();
            orders = orders.filter(o =>
                String(o.id).includes(q) ||
                (o.customerId ?? '').toLowerCase().includes(q) ||
                (o.city ?? '').toLowerCase().includes(q) ||
                (o.quotationId ?? '').toLowerCase().includes(q)
            );
        }
        return orders;
    }

    get statusCounts(): Record<string, number> {
        const counts: Record<string, number> = { all: this.allOrders.length };
        for (const status of Object.values(ApiOrderStatus)) {
            counts[status] = this.allOrders.filter(o => o.status === status).length;
        }
        return counts;
    }

    get filterStatuses(): ApiOrderStatus[] {
        return Object.values(ApiOrderStatus).filter(s => (this.statusCounts[s] ?? 0) > 0);
    }

    viewOrder(id: number) {
        this.router.navigate(['/orders', id]);
    }
}
