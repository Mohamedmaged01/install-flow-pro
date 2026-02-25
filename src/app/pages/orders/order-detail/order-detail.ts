import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { OrdersService } from '../../../services/orders.service';
import { TasksService } from '../../../services/tasks.service';
import { DepartmentsService } from '../../../services/departments.service';
import {
    ApiOrder, ApiOrderStatus, ApiOrderHistoryEntry,
    ApiTask, ApiTaskStatus, AssignTaskDto, TaskStatusUpdateDto,
    ApiRole, OrderActionDto,
} from '../../../models/api-models';
import { UserRole } from '../../../models';
import { StatusBadge } from '../../../components/status-badge/status-badge';
import {
    LucideAngularModule, ArrowRight, Clock, MapPin, User, Phone, Mail,
    FileText, Send, CheckCircle, XCircle, UserPlus, QrCode, Pause, Play,
    RotateCcw, AlertTriangle, Clipboard, Upload, Edit, ShieldCheck,
} from 'lucide-angular';

const RETURN_REASONS = [
    'بيانات ناقصة',
    'عنوان غير صحيح',
    'تعارض في الجدول',
    'يحتاج موافقة إضافية',
    'تغيير في نطاق العمل',
    'قطعة مفقودة',
    'الموقع غير جاهز',
    'أخرى',
];

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [LucideAngularModule, StatusBadge, FormsModule],
    templateUrl: './order-detail.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetail implements OnInit, AfterViewInit {
    readonly ArrowRight = ArrowRight;
    readonly Clock = Clock;
    readonly MapPin = MapPin;
    readonly UserIcon = User;
    readonly Phone = Phone;
    readonly MailIcon = Mail;
    readonly FileText = FileText;
    readonly Send = Send;
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly UserPlus = UserPlus;
    readonly QrCode = QrCode;
    readonly Pause = Pause;
    readonly Play = Play;
    readonly RotateCcw = RotateCcw;
    readonly AlertTriangle = AlertTriangle;
    readonly Clipboard = Clipboard;
    readonly Upload = Upload;
    readonly Edit = Edit;
    readonly ShieldCheck = ShieldCheck;
    readonly ApiOrderStatus = ApiOrderStatus;
    readonly ApiTaskStatus = ApiTaskStatus;
    readonly UserRole = UserRole;
    readonly RETURN_REASONS = RETURN_REASONS;

    readonly STATUS_LABELS: Record<ApiOrderStatus, string> = {
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

    order: ApiOrder | null = null;
    history: ApiOrderHistoryEntry[] = [];
    tasks: ApiTask[] = [];
    availableTechnicians: { id: number; name: string }[] = [];
    isLoading = false;
    isSubmitting = false;

    qrImageUrl = '';

    // Assign modal
    showAssignModal = false;
    selectedTechId: number = 0;
    assignNotes = '';

    // Evidence modal
    showEvidenceModal = false;
    evidenceNote = '';
    evidenceFiles: File[] = [];

    // Task status modal
    showStatusModal = false;
    activeTask: ApiTask | null = null;
    newTaskStatus: ApiTaskStatus = ApiTaskStatus.Accepted;
    taskStatusNote = '';

    // ─── Return modal ───
    showReturnModal = false;
    returnReason = '';
    returnCustomReason = '';
    returnNote = '';

    // ─── Change Order Status modal ───
    showOrderStatusModal = false;
    selectedOrderStatus: ApiOrderStatus = ApiOrderStatus.PendingSalesManager;
    orderStatusNote = '';

    // Snapshot auth signals to avoid NG0100
    private _role: UserRole | null = null;
    private _userId = 0;

    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private toast: ToastService,
        private ordersService: OrdersService,
        private tasksService: TasksService,
        private departmentsService: DepartmentsService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        this._role = this.auth.userRole();
        this._userId = this.auth.userId();
        const id = parseInt(this.route.snapshot.params['id'], 10);
        if (!isNaN(id)) this.loadOrder(id);
    }

    ngAfterViewInit() {
        // Removed generateQRImage from here to prevent ExpressionChangedAfterItHasBeenCheckedError
        // The QR is already generated in loadOrder() when the data arrives.
    }

    loadOrder(id: number) {
        this.isLoading = true;
        this.cdr.markForCheck();
        this.ordersService.getById(id).subscribe({
            next: (order) => {
                this.order = order;
                this.isLoading = false;
                this.cdr.markForCheck();
                if (this.order) {
                    this.loadHistory(id);
                    this.loadTasks();
                    if (this.order.departmentId) this.loadTechnicians(this.order.departmentId);
                    if (this.order.qrToken) this.generateQRImage(this.order.qrToken);
                }
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
                this.toast.error('غير موجود', 'لم يتم العثور على الأمر');
            },
        });
    }

    loadHistory(orderId: number) {
        this.ordersService.getHistory(orderId).subscribe({
            next: (h) => { this.history = h; this.cdr.markForCheck(); },
            error: () => { },
        });
    }

    loadTasks() {
        // Gate for 403: Sales Reps are typically not allowed to see all tasks at the Tasks controller
        // Only load if user is not a Sales Rep or if the backend role permits it.
        if (this.isSalesRep) return;

        this.tasksService.getAll().subscribe({
            next: (tasks) => {
                this.tasks = (tasks || []).filter(t => t.orderId === this.order?.id);
                this.cdr.markForCheck();
            },
            error: () => { },
        });
    }

    loadTechnicians(departmentId: number) {
        const branchId = this.order?.branchId ?? 1;
        this.departmentsService.getUsers(branchId, departmentId).subscribe({
            next: (users) => {
                this.availableTechnicians = users
                    .filter(u => u.role === ApiRole.Technician)
                    .map(u => ({ id: u.id, name: u.name }));
                this.cdr.markForCheck();
            },
            error: () => { },
        });
    }

    async generateQRImage(token: string) {
        try {
            const QRCode = await import('qrcode');
            this.qrImageUrl = await QRCode.toDataURL(token, {
                width: 200, margin: 2,
                color: { dark: '#1e293b', light: '#ffffff' },
            });
        } catch { this.qrImageUrl = ''; }
    }

    goBack() { this.router.navigate(['/jobs']); }

    // ─── Role helpers ───
    get role() { return this._role; }
    get isSalesRep() { return this.role === UserRole.SALES_REP; }
    get isSalesManager() { return this.role === UserRole.SALES_MANAGER; }
    get isSupervisor() { return this.role === UserRole.SUPERVISOR; }
    get isTechnician() { return this.role === UserRole.TECHNICIAN; }
    get isAdmin() { return this.role === UserRole.ADMIN; }

    get canApprove() {
        if (!this.order) return false;
        if (this.isSalesManager) return this.order.status === ApiOrderStatus.PendingSalesManager;
        if (this.isSupervisor) return this.order.status === ApiOrderStatus.PendingSupervisor;
        return false;
    }
    get canAssignTechnician() {
        return (this.isSupervisor || this.isAdmin) &&
            (this.order?.status === ApiOrderStatus.PendingSupervisor || this.order?.status === ApiOrderStatus.InProgress);
    }
    get canReturn() {
        if (!this.order) return false;
        if (this.isAdmin) return true;
        if (this.isSalesManager) return this.order.status === ApiOrderStatus.PendingSalesManager;
        if (this.isSupervisor) return this.order.status === ApiOrderStatus.PendingSupervisor || this.order.status === ApiOrderStatus.InProgress || this.order.status === ApiOrderStatus.PendingQR;
        if (this.isTechnician) return this.order.status === ApiOrderStatus.InProgress;
        return false;
    }
    get canCancel() {
        if (!this.order) return false;
        if (this.isAdmin) return true;
        if (this.isSalesManager) return this.order.status === ApiOrderStatus.PendingSalesManager;
        if (this.isSupervisor) return this.order.status === ApiOrderStatus.PendingSupervisor;
        return false;
    }
    get canScanQr() {
        return (this.isTechnician || this.isSupervisor || this.isAdmin) &&
            this.order?.status === ApiOrderStatus.PendingQR;
    }
    get canOverrideClose() {
        return this.isAdmin && this.order?.status === ApiOrderStatus.PendingQR;
    }
    get canUploadEvidence() {
        return (this.isTechnician || this.isSupervisor || this.isAdmin) &&
            (this.order?.status === ApiOrderStatus.InProgress || this.order?.status === ApiOrderStatus.PendingQR);
    }
    get canEditOrder() {
        return this.isSalesRep && (this.order?.status === ApiOrderStatus.Returned || this.order?.status === ApiOrderStatus.Draft);
    }

    // ─── Approve ───
    approveOrder() {
        if (!this.order) return;
        this.isSubmitting = true;

        // If supervisor, approving means moving to InProgress if assigned, 
        // but usually they just assign. Let's stick to the workflow:
        // Sales Manager approves -> moves to PendingSupervisor.
        const nextStatus = this.isSalesManager ? ApiOrderStatus.PendingSupervisor : ApiOrderStatus.InProgress;

        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: nextStatus,
            role: this.apiRole,
            note: 'تمت الموافقة',
        };
        this.ordersService.handleOrder(this.order.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.cdr.markForCheck();
                this.toast.success('تمت الموافقة', this.isSalesManager ? 'تم إرسال الأمر للمشرف' : 'تم تفعيل الأمر');
                if (this.order) this.loadOrder(this.order.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    // ─── Cancel ───
    cancelOrder() {
        if (!this.order) return;
        this.isSubmitting = true;
        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: ApiOrderStatus.Cancelled,
            role: this.apiRole,
            note: 'تم الإلغاء',
        };
        this.ordersService.handleOrder(this.order.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.cdr.markForCheck();
                this.toast.error('تم الإلغاء', 'تم إلغاء الأمر');
                if (this.order) this.loadOrder(this.order.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    // ─── Return modal ───
    openReturnModal() {
        this.returnReason = '';
        this.returnCustomReason = '';
        this.returnNote = '';
        this.showReturnModal = true;
    }

    submitReturn() {
        const reason = this.returnReason === 'أخرى' ? this.returnCustomReason : this.returnReason;
        if (!reason.trim()) {
            this.toast.error('مطلوب', 'يرجى تحديد سبب الإرجاع');
            return;
        }
        if (!this.order) return;
        this.isSubmitting = true;
        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: ApiOrderStatus.Returned,
            role: this.apiRole,
            note: reason + (this.returnNote ? ' — ' + this.returnNote : ''),
        };
        this.ordersService.handleOrder(this.order.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showReturnModal = false;
                this.cdr.markForCheck();
                this.toast.info('تم الإرجاع', `تم إرجاع الأمر — السبب: ${reason}`);
                if (this.order) this.loadOrder(this.order.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    get apiRole(): ApiRole {
        switch (this.role) {
            case UserRole.SALES_MANAGER: return ApiRole.SalesManager;
            case UserRole.SUPERVISOR: return ApiRole.Supervisor;
            case UserRole.TECHNICIAN: return ApiRole.Technician;
            default: return ApiRole.Admin;
        }
    }

    // ─── Change Order Status (generic) ───
    get allOrderStatuses(): ApiOrderStatus[] {
        return Object.values(ApiOrderStatus);
    }

    openOrderStatusModal() {
        if (!this.order) return;
        this.selectedOrderStatus = this.order.status;
        this.orderStatusNote = '';
        this.showOrderStatusModal = true;
    }

    submitOrderStatusChange() {
        if (!this.order) return;
        this.isSubmitting = true;
        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: this.selectedOrderStatus,
            role: this.apiRole,
            note: this.orderStatusNote || 'تغيير حالة الأمر',
        };
        this.ordersService.handleOrder(this.order.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showOrderStatusModal = false;
                this.cdr.markForCheck();
                this.toast.success('تم التحديث', `تم تغيير حالة الأمر إلى "${this.ORDER_STATUS_LABELS[this.selectedOrderStatus]}"`);
                if (this.order) this.loadOrder(this.order.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    readonly ORDER_STATUS_LABELS: Record<ApiOrderStatus, string> = {
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

    // ─── Assign Technician ───
    openAssignModal() {
        this.showAssignModal = true;
        this.selectedTechId = 0;
        this.assignNotes = '';
    }

    assignTechnician() {
        if (!this.order || !this.selectedTechId) return;
        this.isSubmitting = true;
        const dto: AssignTaskDto = {
            orderId: this.order.id,
            technicianId: this.selectedTechId,
            notes: this.assignNotes,
        };
        this.tasksService.assign(dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showAssignModal = false;
                this.cdr.markForCheck();
                const tech = this.availableTechnicians.find(t => t.id === this.selectedTechId);
                this.toast.success('تم التعيين', `تم تعيين ${tech?.name ?? 'الفني'} على الأمر`);
                this.loadTasks();
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    // ─── Task Status ───
    openStatusModal(task: ApiTask) {
        this.activeTask = task;
        this.newTaskStatus = task.status;
        this.taskStatusNote = '';
        this.showStatusModal = true;
    }

    submitTaskStatus() {
        if (!this.activeTask) return;
        this.isSubmitting = true;
        const dto: TaskStatusUpdateDto = {
            newStatus: this.newTaskStatus,
            notes: this.taskStatusNote,
        };
        this.tasksService.updateStatus(this.activeTask.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showStatusModal = false;
                this.cdr.markForCheck();
                this.toast.success('تم التحديث', `تم تحديث حالة المهمة إلى "${this.taskStatusStatusLabel}"`);
                this.loadTasks();

                // If technician completes task, check if we should move order to PendingQR
                if (this.newTaskStatus === ApiTaskStatus.Completed && this.order && this.order.status === ApiOrderStatus.InProgress) {
                    this.moveToPendingQR();
                }

                if (this.order) this.loadHistory(this.order.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    private moveToPendingQR() {
        if (!this.order) return;
        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: ApiOrderStatus.PendingQR,
            role: this.apiRole,
            note: 'تم إكمال المهام وبانتظار مسح QR',
        };
        this.ordersService.handleOrder(this.order.id, dto).subscribe({
            next: () => { if (this.order) this.loadOrder(this.order.id); }
        });
    }

    // ─── QR Scanning ───
    showScanModal = false;
    scanToken = '';

    openScanModal() {
        this.scanToken = '';
        this.showScanModal = true;
    }

    submitScan() {
        if (!this.order || !this.scanToken.trim()) return;
        this.isSubmitting = true;
        this.ordersService.verifyQr({ orderId: this.order!.id, token: this.scanToken }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showScanModal = false;
                this.cdr.markForCheck();
                this.toast.success('تم التحقق', 'تم إغلاق الأمر بنجاح عبر رمز QR');
                this.loadOrder(this.order!.id);
            },
            error: () => {
                this.isSubmitting = false;
                this.cdr.markForCheck();
                this.toast.error('خطأ', 'رمز QR غير صحيح أو منتهي الصالحية');
            },
        });
    }

    // ─── Admin Override Close ───
    submitOverrideClose() {
        if (!this.order) return;
        if (!confirm('هل أنت متأكد من إغلاق الأمر يدوياً بدون مسح QR؟')) return;

        this.isSubmitting = true;
        const dto: OrderActionDto = {
            currentUserId: this._userId,
            nextStatus: ApiOrderStatus.Closed,
            role: ApiRole.Admin,
            note: 'إغلاق إداري (تجاوز QR)',
        };
        this.ordersService.handleOrder(this.order!.id, dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.cdr.markForCheck();
                this.toast.success('تم الإغلاق', 'تم إغلاق الأمر يدوياً');
                this.loadOrder(this.order!.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    get taskStatusStatusLabel(): string {
        const labels: Record<ApiTaskStatus, string> = {
            [ApiTaskStatus.Assigned]: 'مُسنَد',
            [ApiTaskStatus.Accepted]: 'مقبول',
            [ApiTaskStatus.Enroute]: 'في الطريق',
            [ApiTaskStatus.Onsite]: 'في الموقع',
            [ApiTaskStatus.InProgress]: 'قيد التنفيذ',
            [ApiTaskStatus.Completed]: 'مكتمل',
            [ApiTaskStatus.Returned]: 'مُعاد',
            [ApiTaskStatus.OnHold]: 'متوقف',
        };
        return labels[this.newTaskStatus] ?? this.newTaskStatus;
    }

    get availableNextStatuses(): ApiTaskStatus[] {
        return Object.values(ApiTaskStatus);
    }

    // ─── Evidence ───
    openEvidenceModal() {
        this.showEvidenceModal = true;
        this.evidenceNote = '';
        this.evidenceFiles = [];
    }

    onFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) this.evidenceFiles = Array.from(input.files);
    }

    submitEvidence() {
        if (!this.order) return;
        this.isSubmitting = true;
        const formData = new FormData();
        formData.append('OrderId', String(this.order.id));
        formData.append('Note', this.evidenceNote);
        this.evidenceFiles.forEach(f => formData.append('Images', f));
        this.ordersService.addEvidence(formData).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showEvidenceModal = false;
                this.cdr.markForCheck();
                this.toast.success('تم الرفع', 'تم رفع الأدلة بنجاح');
                if (this.order) this.loadHistory(this.order.id);
            },
            error: () => { this.isSubmitting = false; this.cdr.markForCheck(); },
        });
    }

    getTimeAgo(timestamp: string): string {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `منذ ${mins} دقيقة`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${Math.floor(hours / 24)} يوم`;
    }

    editOrder() {
        if (this.order) this.router.navigate(['/orders', this.order.id, 'edit']);
    }
}
