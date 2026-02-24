import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrdersService } from '../../services/orders.service';
import { ApiOrder, ApiOrderStatus, ApiPriority } from '../../models/api-models';
import { UserRole } from '../../models';
import { StatusBadge } from '../../components/status-badge/status-badge';
import {
    LucideAngularModule, Search, Filter, Eye, FileText, RefreshCw,
    Plus, AlertTriangle, Clock, ChevronRight, ChevronLeft
} from 'lucide-angular';

const STATUS_LABEL_MAP: Record<ApiOrderStatus, string> = {
    [ApiOrderStatus.Draft]: 'مسودة',
    [ApiOrderStatus.PendingSalesManager]: 'بانتظار مدير المبيعات',
    [ApiOrderStatus.PendingSupervisor]: 'بانتظار المشرف',
    [ApiOrderStatus.InProgress]: 'قيد التنفيذ',
    [ApiOrderStatus.Completed]: 'مكتمل',
    [ApiOrderStatus.Returned]: 'مُعاد',
    [ApiOrderStatus.Cancelled]: 'ملغي',
};

const PAGE_SIZE = 15;

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [LucideAngularModule, StatusBadge, FormsModule],
    templateUrl: './orders.html',
})
export class Orders implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly Eye = Eye;
    readonly FileText = FileText;
    readonly RefreshCw = RefreshCw;
    readonly Plus = Plus;
    readonly AlertTriangle = AlertTriangle;
    readonly ClockIcon = Clock;
    readonly ChevronRight = ChevronRight;
    readonly ChevronLeft = ChevronLeft;
    readonly ApiOrderStatus = ApiOrderStatus;
    readonly ApiPriority = ApiPriority;
    readonly STATUS_LABEL_MAP = STATUS_LABEL_MAP;
    readonly UserRole = UserRole;

    // Filters
    statusFilter: ApiOrderStatus | 'all' = 'all';
    priorityFilter: ApiPriority | 'all' = 'all';
    cityFilter = '';
    searchQuery = '';
    myTasksOnly = false;

    // Data
    allOrders: ApiOrder[] = [];
    isLoading = false;

    // Pagination
    currentPage = 1;
    readonly pageSize = PAGE_SIZE;

    constructor(
        public auth: AuthService,
        private ordersApi: OrdersService,
        private router: Router,
    ) { }

    ngOnInit() {
        // Technicians default to "My Tasks" view
        if (this.auth.userRole() === UserRole.TECHNICIAN) {
            this.myTasksOnly = true;
        }
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        this.ordersApi.getAll().subscribe({
            next: (orders) => {
                this.allOrders = orders;
                this.isLoading = false;
                this.currentPage = 1;
            },
            error: () => { this.isLoading = false; },
        });
    }

    get filteredOrders(): ApiOrder[] {
        let orders = this.allOrders;

        // My Tasks filter: filter by createdByUserId matching current user
        if (this.myTasksOnly) {
            const userId = this.auth.user()?.id;
            if (userId) {
                orders = orders.filter(o => String((o as any).createdByUserId) === String(userId));
            }
        }

        if (this.statusFilter !== 'all') {
            orders = orders.filter(o => o.status === this.statusFilter);
        }

        if (this.priorityFilter !== 'all') {
            orders = orders.filter(o => (o as any).priority === this.priorityFilter);
        }

        if (this.cityFilter.trim()) {
            orders = orders.filter(o => (o.city ?? '').toLowerCase().includes(this.cityFilter.toLowerCase()));
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

    get pagedOrders(): ApiOrder[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredOrders.slice(start, start + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
    }

    get pages(): number[] {
        const total = this.totalPages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        // Windowed pagination
        const cur = this.currentPage;
        const pages: number[] = [1];
        if (cur > 3) pages.push(-1); // ellipsis
        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
        if (cur < total - 2) pages.push(-1);
        pages.push(total);
        return pages;
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
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

    get uniqueCities(): string[] {
        return [...new Set(this.allOrders.map(o => o.city).filter(Boolean))].sort() as string[];
    }

    isOverdue(order: ApiOrder): boolean {
        if (!order.scheduledDate) return false;
        return new Date(order.scheduledDate) < new Date() &&
            order.status !== ApiOrderStatus.Completed &&
            order.status !== ApiOrderStatus.Cancelled;
    }

    isTechnician(): boolean {
        return this.auth.userRole() === UserRole.TECHNICIAN;
    }

    isSupervisorOrAbove(): boolean {
        const role = this.auth.userRole();
        return role === UserRole.SUPERVISOR || role === UserRole.ADMIN || role === UserRole.SALES_MANAGER;
    }

    viewOrder(id: number) {
        this.router.navigate(['/orders', id]);
    }

    createOrder() {
        this.router.navigate(['/orders/create']);
    }

    onFilterChange() {
        this.currentPage = 1;
    }
}
