import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';
import { OrdersService } from '../../services/orders.service';
import { DepartmentsService } from '../../services/departments.service';
import { finalize } from 'rxjs/operators';
import {
    ApiTask, ApiTaskStatus, TaskStatusUpdateDto,
    AssignTaskDto, ApiOrder, ApiRole, ApiOrderStatus, OrderActionDto
} from '../../models/api-models';
import { UserRole } from '../../models';
import {
    LucideAngularModule, ClipboardList, RefreshCw, CheckCircle,
    Clock, MapPin, Play, ChevronRight, AlertTriangle, Plus, QrCode
} from 'lucide-angular';
import { FormsModule } from '@angular/forms';

const TASK_STATUS_LABELS: Record<ApiTaskStatus, string> = {
    [ApiTaskStatus.Assigned]: 'مُسنَد',
    [ApiTaskStatus.Accepted]: 'مقبول',
    [ApiTaskStatus.Enroute]: 'في الطريق',
    [ApiTaskStatus.Onsite]: 'في الموقع',
    [ApiTaskStatus.InProgress]: 'قيد التنفيذ',
    [ApiTaskStatus.Completed]: 'مكتمل',
    [ApiTaskStatus.Returned]: 'مُعاد',
    [ApiTaskStatus.OnHold]: 'متوقف',
};

const TASK_STATUS_COLORS: Record<ApiTaskStatus, string> = {
    [ApiTaskStatus.Assigned]: 'bg-slate-100 text-slate-600',
    [ApiTaskStatus.Accepted]: 'bg-blue-100 text-blue-700',
    [ApiTaskStatus.Enroute]: 'bg-amber-100 text-amber-700',
    [ApiTaskStatus.Onsite]: 'bg-orange-100 text-orange-700',
    [ApiTaskStatus.InProgress]: 'bg-indigo-100 text-indigo-700',
    [ApiTaskStatus.Completed]: 'bg-emerald-100 text-emerald-700',
    [ApiTaskStatus.Returned]: 'bg-red-100 text-red-700',
    [ApiTaskStatus.OnHold]: 'bg-yellow-100 text-yellow-700',
};

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './tasks.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tasks implements OnInit {
    readonly ClipboardList = ClipboardList;
    readonly RefreshCw = RefreshCw;
    readonly CheckCircle = CheckCircle;
    readonly ClockIcon = Clock;
    readonly MapPin = MapPin;
    readonly Play = Play;
    readonly ChevronRight = ChevronRight;
    readonly AlertTriangle = AlertTriangle;
    readonly Plus = Plus;
    readonly QrCode = QrCode;
    readonly ApiTaskStatus = ApiTaskStatus;
    readonly TASK_STATUS_LABELS = TASK_STATUS_LABELS;
    readonly TASK_STATUS_COLORS = TASK_STATUS_COLORS;
    readonly UserRole = UserRole;

    tasks: ApiTask[] = [];
    isLoading = false;
    loadError = false;

    // Snapshot role to avoid NG0100 (signal changing during CD)
    private _userRole: UserRole = UserRole.TECHNICIAN;
    private _userId = 0;

    // Status update modal
    showStatusModal = false;
    activeTask: ApiTask | null = null;
    newStatus: ApiTaskStatus = ApiTaskStatus.Accepted;
    statusNote = '';
    isSubmitting = false;

    // ─── Create Task modal ───
    showCreateModal = false;
    createForm = { orderId: 0, technicianId: 0, notes: '' };
    availableOrders: ApiOrder[] = [];
    availableTechnicians: { id: number; name: string }[] = [];
    isLoadingTechs = false;

    constructor(
        private auth: AuthService,
        private tasksService: TasksService,
        private ordersService: OrdersService,
        private departmentsService: DepartmentsService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        this._userRole = this.auth.userRole() ?? UserRole.TECHNICIAN;
        this._userId = this.auth.userId();
        this.loadTasks();
    }

    loadTasks() {
        this.isLoading = true;
        this.loadError = false;
        this.cdr.markForCheck();
        this.tasksService.getAll()
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }))
            .subscribe({
                next: (tasks) => {
                    this.tasks = tasks ?? [];
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loadError = true;
                    this.cdr.markForCheck();
                },
            });
    }

    get activeTasks(): ApiTask[] {
        return this.tasks.filter(t =>
            t.status !== ApiTaskStatus.Completed && t.status !== ApiTaskStatus.Returned
        );
    }

    get completedTasks(): ApiTask[] {
        return this.tasks.filter(t =>
            t.status === ApiTaskStatus.Completed || t.status === ApiTaskStatus.Returned
        );
    }

    openStatusModal(task: ApiTask) {
        this.activeTask = task;
        this.newStatus = task.status;
        this.statusNote = '';
        this.showStatusModal = true;
    }

    closeStatusModal() {
        this.showStatusModal = false;
        this.activeTask = null;
    }

    submitStatusUpdate() {
        if (!this.activeTask) return;
        this.isSubmitting = true;
        const dto: TaskStatusUpdateDto = {
            newStatus: this.newStatus,
            notes: this.statusNote,
        };
        this.tasksService.updateStatus(this.activeTask.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showStatusModal = false;

                // If technician completes task, move order to PendingQR
                if (this.newStatus === ApiTaskStatus.Completed) {
                    this.moveToPendingQR(this.activeTask!.orderId);
                }

                this.loadTasks();
            },
            error: () => { this.isSubmitting = false; },
        });
    }

    private moveToPendingQR(orderId: number) {
        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: ApiOrderStatus.PendingQR,
            role: ApiRole.Technician,
            note: 'تم إكمال المهمة وبانتظار مسح QR',
        };
        this.ordersService.handleOrder(orderId, dto).subscribe({
            next: () => { }
        });
    }

    get nextStatuses(): ApiTaskStatus[] {
        return Object.values(ApiTaskStatus);
    }

    viewOrder(orderId: number) {
        this.router.navigate(['/orders', orderId]);
    }

    getTimeAgo(timestamp: string): string {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `منذ ${mins} دقيقة`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${Math.floor(hours / 24)} يوم`;
    }

    // ─── Create Task ───
    openCreateModal() {
        this.createForm = { orderId: 0, technicianId: 0, notes: '' };
        this.availableTechnicians = [];
        this.showCreateModal = true;
        this.ordersService.getAll().subscribe({
            next: (orders) => { this.availableOrders = orders; },
            error: () => { },
        });
    }

    onOrderSelected() {
        const order = this.availableOrders.find(o => o.id === +this.createForm.orderId);
        if (!order) return;
        this.createForm.technicianId = 0;
        this.availableTechnicians = [];
        this.isLoadingTechs = true;
        this.departmentsService.getUsers(order.branchId, order.departmentId).subscribe({
            next: (users) => {
                this.availableTechnicians = users
                    .filter(u => u.role === ApiRole.Technician)
                    .map(u => ({ id: u.id, name: u.name }));
                this.isLoadingTechs = false;
            },
            error: () => { this.isLoadingTechs = false; },
        });
    }

    submitCreateTask() {
        if (!this.createForm.orderId || !this.createForm.technicianId) return;
        this.isSubmitting = true;
        const dto: AssignTaskDto = {
            orderId: +this.createForm.orderId,
            technicianId: +this.createForm.technicianId,
            notes: this.createForm.notes,
        };
        this.tasksService.assign(dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showCreateModal = false;
                this.loadTasks();
            },
            error: () => { this.isSubmitting = false; },
        });
    }

    // ─── QR Scanning ───
    showScanModal = false;
    scanToken = '';
    scanningOrderId: number | null = null;

    openScanModal(task: ApiTask) {
        this.scanningOrderId = task.orderId;
        this.scanToken = '';
        this.showScanModal = true;
    }

    submitScan() {
        if (!this.scanningOrderId || !this.scanToken.trim()) return;
        this.isSubmitting = true;
        this.ordersService.verifyQr({ orderId: this.scanningOrderId, token: this.scanToken }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showScanModal = false;
                this.loadTasks();
            },
            error: () => {
                this.isSubmitting = false;
            },
        });
    }

    canScanQr(task: ApiTask): boolean {
        // This is a bit tricky because the Task object doesn't have the Order Status
        // For simplicity in this UI, we allow it if the task is completed
        return task.status === ApiTaskStatus.Completed;
    }

    get canCreateTask(): boolean {
        return this._userRole === UserRole.ADMIN || this._userRole === UserRole.SUPERVISOR || this._userRole === UserRole.SALES_MANAGER;
    }
}
