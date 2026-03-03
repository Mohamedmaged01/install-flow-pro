import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrdersService } from '../../services/orders.service';
import { TasksService } from '../../services/tasks.service';
import { DepartmentsService } from '../../services/departments.service';
import { BranchesService } from '../../services/branches.service';
import { ToastService } from '../../services/toast.service';
import { ApiOrder, ApiOrderStatus, ApiPriority, AssignTaskDto, ApiRole, ApiTask, ApiTaskStatus, TaskStatusUpdateDto, ApiBranch, ApiDepartment } from '../../models/api-models';
import { ApexDocument, ApexResponse } from '../../models/apex-models';
import { UserRole } from '../../models';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { formatDateUTC3, getTimeAgoUTC3 } from '../../utils/date-utils';
import { environment } from '../../../environments/environment';
import {
    LucideAngularModule, Search, Filter, Eye, FileText, RefreshCw,
    Plus, AlertTriangle, Clock, ChevronRight, ChevronLeft
} from 'lucide-angular';

const STATUS_LABEL_MAP: Record<ApiOrderStatus, string> = {
    [ApiOrderStatus.Draft]: 'مسودة',
    [ApiOrderStatus.PendingSalesManager]: 'بانتظار مدير المبيعات',
    [ApiOrderStatus.PendingSupervisor]: 'بانتظار المشرف',
    [ApiOrderStatus.InProgress]: 'قيد التنفيذ',
    [ApiOrderStatus.PendingQR]: 'بانتظار تأكيد QR',
    [ApiOrderStatus.Completed]: 'مكتمل',
    [ApiOrderStatus.Closed]: 'مغلق',
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

    readonly TASK_STATUS_LABELS: Record<ApiTaskStatus, string> = {
        [ApiTaskStatus.Assigned]: 'مُعيَّن',
        [ApiTaskStatus.Accepted]: 'مقبول',
        [ApiTaskStatus.Enroute]: 'في الطريق',
        [ApiTaskStatus.Onsite]: 'في الموقع',
        [ApiTaskStatus.InProgress]: 'جارٍ',
        [ApiTaskStatus.Completed]: 'مكتمل',
        [ApiTaskStatus.Returned]: 'مُعاد',
        [ApiTaskStatus.OnHold]: 'معلّق',
    };

    readonly TASK_STATUS_COLORS: Record<ApiTaskStatus, string> = {
        [ApiTaskStatus.Assigned]: 'bg-blue-100 text-blue-700',
        [ApiTaskStatus.Accepted]: 'bg-indigo-100 text-indigo-700',
        [ApiTaskStatus.Enroute]: 'bg-purple-100 text-purple-700',
        [ApiTaskStatus.Onsite]: 'bg-orange-100 text-orange-700',
        [ApiTaskStatus.InProgress]: 'bg-amber-100 text-amber-700',
        [ApiTaskStatus.Completed]: 'bg-emerald-100 text-emerald-700',
        [ApiTaskStatus.Returned]: 'bg-red-100 text-red-700',
        [ApiTaskStatus.OnHold]: 'bg-yellow-100 text-yellow-700',
    };

    readonly ALL_TASK_STATUSES = Object.values(ApiTaskStatus);

    // Filters
    statusFilter: ApiOrderStatus | 'all' = 'all';
    priorityFilter: ApiPriority | 'all' = 'all';
    cityFilter = '';
    searchQuery = '';
    myTasksOnly = false;

    // Snapshot of current user ID — set once in ngOnInit to avoid NG0100
    currentUserId = '0';

    // Data
    allOrders: ApiOrder[] = [];
    allTasks: ApiTask[] = [];
    tasksByOrder: Record<number, ApiTask[]> = {};
    isLoading = false;

    // ─── APEX enrichment ───
    apexDocMap: Record<string, ApexDocument> = {};

    // Pagination
    currentPage = 1;
    readonly pageSize = PAGE_SIZE;

    // Branch & Department name maps
    branchMap: Record<number, string> = {};
    departmentMap: Record<number, string> = {};

    // Date helpers exposed to template
    readonly formatDateUTC3 = formatDateUTC3;

    constructor(
        public auth: AuthService,
        private ordersApi: OrdersService,
        private tasksService: TasksService,
        private departmentsService: DepartmentsService,
        private branchesService: BranchesService,
        private toast: ToastService,
        private router: Router,
        private http: HttpClient,
    ) { }

    ngOnInit() {
        this.currentUserId = this.auth.user()?.id ?? '0';
        if (this.auth.userRole() === UserRole.TECHNICIAN) {
            this.myTasksOnly = true;
        }
        this.loadOrders();
        if (!this.isSalesRep()) {
            this.loadTasks();
        }
        this.loadBranchesAndDepartments();
        this.loadApexDocuments();
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

    loadTasks() {
        this.tasksService.getAll().subscribe({
            next: (tasks) => {
                this.allTasks = tasks;
                this.tasksByOrder = tasks.reduce((acc, t) => {
                    if (!acc[t.orderId]) acc[t.orderId] = [];
                    acc[t.orderId].push(t);
                    return acc;
                }, {} as Record<number, ApiTask[]>);
            },
            error: () => { },
        });
    }

    // ─── APEX enrichment: load offers + invoices and build a lookup map ───
    loadApexDocuments() {
        this.loadApexPage('OfferPricesController/getOfferPrice', 1);
        this.loadApexPage('InvoiceServices/GetInvoices', 1);
    }

    private loadApexPage(path: string, page: number) {
        const params = new HttpParams()
            .set('PassKey', environment.apexPassKey)
            .set('PageNumber', page)
            .set('PageSize', 20);

        this.http.get<ApexResponse<ApexDocument[]>>(
            `${environment.apexUrl}/${path}`, { params }
        ).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    for (const doc of res.data) {
                        this.apexDocMap[doc.code] = doc;
                    }
                    // If we got a full page, load the next one
                    if (res.data.length >= 20) {
                        this.loadApexPage(path, page + 1);
                    }
                }
            },
            error: () => { },
        });
    }

    /** Get the APEX document for an order (by quotationId or invoiceId) */
    getApexDoc(order: ApiOrder): ApexDocument | null {
        if (order.quotationId && this.apexDocMap[order.quotationId]) {
            return this.apexDocMap[order.quotationId];
        }
        if (order.invoiceId && this.apexDocMap[order.invoiceId]) {
            return this.apexDocMap[order.invoiceId];
        }
        return null;
    }

    /** Get customer name from APEX, falling back to order.customerId */
    getCustomerName(order: ApiOrder): string {
        const doc = this.getApexDoc(order);
        return doc?.customer?.arabicName || order.customerId || '—';
    }

    /** Get customer code from APEX */
    getCustomerCode(order: ApiOrder): string {
        const doc = this.getApexDoc(order);
        return doc?.customer?.code || '';
    }

    /** Get the APEX document reference label */
    getDocRef(order: ApiOrder): string {
        return order.quotationId || order.invoiceId || '';
    }

    getOrderTasks(orderId: number): ApiTask[] {
        return this.tasksByOrder[orderId] ?? [];
    }

    get filteredOrders(): ApiOrder[] {
        let orders = this.allOrders;

        if (this.isSalesRep()) {
            orders = orders.filter(o =>
                o.status === ApiOrderStatus.Draft || o.status === ApiOrderStatus.PendingSalesManager
            );
        }

        if (this.myTasksOnly) {
            const userId = this.currentUserId;
            if (userId && userId !== '0') {
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
                this.getCustomerName(o).toLowerCase().includes(q) ||
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
        const cur = this.currentPage;
        const pages: number[] = [1];
        if (cur > 3) pages.push(-1);
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

    isSalesRep(): boolean {
        return this.auth.userRole() === UserRole.SALES_REP;
    }

    isSupervisorOrAbove(): boolean {
        const role = this.auth.userRole();
        return role === UserRole.SUPERVISOR || role === UserRole.ADMIN || role === UserRole.SALES_MANAGER;
    }

    // ─── Branch / Department name resolution ───
    loadBranchesAndDepartments() {
        this.branchesService.getAll().subscribe({
            next: (branches) => {
                for (const b of branches) {
                    this.branchMap[b.id] = b.name;
                }
            },
            error: () => { },
        });
    }

    getBranchName(id: number): string {
        return this.branchMap[id] ?? `#${id}`;
    }

    getDepartmentName(branchId: number, deptId: number): string {
        if (this.departmentMap[deptId]) return this.departmentMap[deptId];
        if (!this.departmentMap[deptId]) {
            this.departmentMap[deptId] = `#${deptId}`;
            this.departmentsService.getByBranch(branchId).subscribe({
                next: (depts) => {
                    for (const d of depts) {
                        this.departmentMap[d.id] = d.name;
                    }
                },
                error: () => { },
            });
        }
        return this.departmentMap[deptId];
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

    // ─── Quick Create Task ───
    showQuickTaskModal = false;
    quickTaskForm = { orderId: 0, technicianId: 0, notes: '' };
    quickTaskOrderCity = '';
    quickTaskTechnicians: { id: number; name: string }[] = [];
    isLoadingTechs = false;
    isSubmittingTask = false;

    openQuickCreateTask(order: ApiOrder) {
        this.quickTaskForm = { orderId: order.id, technicianId: 0, notes: '' };
        this.quickTaskOrderCity = order.city;
        this.quickTaskTechnicians = [];
        this.isLoadingTechs = true;
        this.showQuickTaskModal = true;
        this.departmentsService.getUsers(order.branchId, order.departmentId).subscribe({
            next: (users) => {
                this.quickTaskTechnicians = users
                    .filter(u => u.role === ApiRole.Technician)
                    .map(u => ({ id: u.id, name: u.name }));
                this.isLoadingTechs = false;
            },
            error: () => { this.isLoadingTechs = false; },
        });
    }

    submitQuickTask() {
        if (!this.quickTaskForm.technicianId) return;
        this.isSubmittingTask = true;
        const dto: AssignTaskDto = {
            orderId: this.quickTaskForm.orderId,
            technicianId: +this.quickTaskForm.technicianId,
            notes: this.quickTaskForm.notes,
        };
        this.tasksService.assign(dto).subscribe({
            next: () => {
                this.isSubmittingTask = false;
                this.showQuickTaskModal = false;
                this.toast.success('تم الإنشاء', `تم تعيين مهمة للأمر #${this.quickTaskForm.orderId}`);
                this.loadTasks();
            },
            error: () => { this.isSubmittingTask = false; },
        });
    }

    // ─── Edit Task Status ───
    showEditTaskModal = false;
    editingTask: ApiTask | null = null;
    editTaskStatus: ApiTaskStatus = ApiTaskStatus.Assigned;
    editTaskNote = '';
    isUpdatingTask = false;

    openEditTaskModal(task: ApiTask, event: Event) {
        event.stopPropagation();
        this.editingTask = task;
        this.editTaskStatus = task.status;
        this.editTaskNote = '';
        this.showEditTaskModal = true;
    }

    submitTaskStatusUpdate() {
        if (!this.editingTask) return;
        this.isUpdatingTask = true;
        const dto: TaskStatusUpdateDto = {
            newStatus: this.editTaskStatus,
            notes: this.editTaskNote,
        };
        this.tasksService.updateStatus(this.editingTask.id, dto).subscribe({
            next: () => {
                this.isUpdatingTask = false;
                this.showEditTaskModal = false;
                this.toast.success('تم التحديث', `تم تحديث حالة المهمة إلى "${this.TASK_STATUS_LABELS[this.editTaskStatus]}"`);
                this.loadTasks();
            },
            error: () => { this.isUpdatingTask = false; },
        });
    }
}
