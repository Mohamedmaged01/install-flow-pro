import { Component, OnInit, AfterViewInit } from '@angular/core';
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
} from '../../../models/api-models';
import { UserRole } from '../../../models';

import { StatusBadge } from '../../../components/status-badge/status-badge';
import {
    LucideAngularModule, ArrowRight, Clock, MapPin, User, Phone, Mail,
    FileText, Send, CheckCircle, XCircle, UserPlus, QrCode, Pause, Play,
    RotateCcw, AlertTriangle, Clipboard, Upload,
} from 'lucide-angular';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [LucideAngularModule, StatusBadge, FormsModule],

    templateUrl: './order-detail.html',
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
    readonly ApiOrderStatus = ApiOrderStatus;
    readonly ApiTaskStatus = ApiTaskStatus;
    readonly UserRole = UserRole;

    // Status labels map
    readonly STATUS_LABELS: Record<ApiOrderStatus, string> = {
        [ApiOrderStatus.Draft]: 'Ù…Ø³ÙˆØ¯Ø©',
        [ApiOrderStatus.PendingSalesManager]: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…Ø¯ÙŠØ± Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª',
        [ApiOrderStatus.PendingSupervisor]: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…Ø´Ø±Ù',
        [ApiOrderStatus.InProgress]: 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°',
        [ApiOrderStatus.Completed]: 'Ù…ÙƒØªÙ…Ù„',
        [ApiOrderStatus.Returned]: 'Ù…ÙØ¹Ø§Ø¯',
        [ApiOrderStatus.Cancelled]: 'Ù…Ù„ØºÙŠ',
    };

    order: ApiOrder | null = null;
    history: ApiOrderHistoryEntry[] = [];
    tasks: ApiTask[] = [];
    availableTechnicians: { id: number; name: string }[] = [];
    isLoading = false;
    isSubmitting = false;

    // QR image
    qrImageUrl = '';

    // Assign task modal state
    showAssignModal = false;
    selectedTechId: number = 0;
    assignNotes = '';

    // Evidence upload state
    showEvidenceModal = false;
    evidenceNote = '';
    evidenceFiles: File[] = [];

    // Task status update
    showStatusModal = false;
    activeTask: ApiTask | null = null;
    newTaskStatus: ApiTaskStatus = ApiTaskStatus.Accepted;
    taskStatusNote = '';

    constructor(
        public auth: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private toast: ToastService,
        private ordersService: OrdersService,
        private tasksService: TasksService,
        private departmentsService: DepartmentsService,
    ) { }

    ngOnInit() {
        const id = parseInt(this.route.snapshot.params['id'], 10);
        if (!isNaN(id)) {
            this.loadOrder(id);
        }
    }

    ngAfterViewInit() {
        if (this.order?.qrToken) {
            this.generateQRImage(this.order.qrToken);
        }
    }

    loadOrder(id: number) {
        this.isLoading = true;
        // Fetch all orders and find the one with matching id
        // (API has no GET /Orders/{id} single endpoint)
        this.ordersService.getAll().subscribe({
            next: (orders) => {
                this.order = orders.find(o => o.id === id) ?? null;
                this.isLoading = false;
                if (this.order) {
                    this.loadHistory(id);
                    this.loadTasks();
                    if (this.order.departmentId) {
                        this.loadTechnicians(this.order.departmentId);
                    }
                    if (this.order.qrToken) {
                        this.generateQRImage(this.order.qrToken);
                    }
                } else {
                    this.toast.error('ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯', 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù…Ø±');
                }
            },
            error: () => { this.isLoading = false; },
        });
    }

    loadHistory(orderId: number) {
        this.ordersService.getHistory(orderId).subscribe({
            next: (h) => { this.history = h; },
            error: () => { },
        });
    }

    loadTasks() {
        this.tasksService.getAll().subscribe({
            next: (tasks) => {
                this.tasks = tasks.filter(t => t.orderId === this.order?.id);
            },
            error: () => { },
        });
    }

    loadTechnicians(departmentId: number) {
        // Get branchId from order, default to 1 if unavailable
        const branchId = this.order?.branchId ?? 1;
        this.departmentsService.getUsers(branchId, departmentId).subscribe({
            next: (users) => {
                this.availableTechnicians = users
                    .filter(u => u.role === ('Technician' as any))
                    .map(u => ({ id: u.id, name: u.name }));
            },
            error: () => { },
        });
    }

    async generateQRImage(token: string) {
        try {
            const QRCode = await import('qrcode');
            this.qrImageUrl = await QRCode.toDataURL(token, {
                width: 200,
                margin: 2,
                color: { dark: '#1e293b', light: '#ffffff' },
            });
        } catch {
            this.qrImageUrl = '';
        }
    }

    goBack() {
        this.router.navigate(['/jobs']);
    }

    // â”€â”€â”€ Supervisor: Assign Technician â”€â”€â”€

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
                const tech = this.availableTechnicians.find(t => t.id === this.selectedTechId);
                this.toast.success('ØªÙ… Ø§Ù„ØªØ¹ÙŠÙŠÙ†', `ØªÙ… ØªØ¹ÙŠÙŠÙ† ${tech?.name ?? 'Ø§Ù„ÙÙ†ÙŠ'} Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù…Ø±`);
                this.loadTasks();
            },
            error: () => { this.isSubmitting = false; },
        });
    }

    // â”€â”€â”€ Technician: Update Task Status â”€â”€â”€

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
                this.toast.success('ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ«', `ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ù‡Ù…Ø© Ø¥Ù„Ù‰ "${this.taskStatusStatusLabel}"`);
                this.loadTasks();
                if (this.order) this.loadHistory(this.order.id);
            },
            error: () => { this.isSubmitting = false; },
        });
    }

    get taskStatusStatusLabel(): string {
        const labels: Record<ApiTaskStatus, string> = {
            [ApiTaskStatus.Assigned]: 'Ù…ÙØ³Ù†ÙŽØ¯',
            [ApiTaskStatus.Accepted]: 'Ù…Ù‚Ø¨ÙˆÙ„',
            [ApiTaskStatus.Enroute]: 'ÙÙŠ Ø§Ù„Ø·Ø±ÙŠÙ‚',
            [ApiTaskStatus.Onsite]: 'ÙÙŠ Ø§Ù„Ù…ÙˆÙ‚Ø¹',
            [ApiTaskStatus.InProgress]: 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°',
            [ApiTaskStatus.Completed]: 'Ù…ÙƒØªÙ…Ù„',
            [ApiTaskStatus.Returned]: 'Ù…ÙØ¹Ø§Ø¯',
            [ApiTaskStatus.OnHold]: 'Ù…ØªÙˆÙ‚Ù',
        };
        return labels[this.newTaskStatus] ?? this.newTaskStatus;
    }

    get availableNextStatuses(): ApiTaskStatus[] {
        return Object.values(ApiTaskStatus);
    }

    // â”€â”€â”€ Evidence Upload â”€â”€â”€

    openEvidenceModal() {
        this.showEvidenceModal = true;
        this.evidenceNote = '';
        this.evidenceFiles = [];
    }

    onFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.evidenceFiles = Array.from(input.files);
        }
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
                this.toast.success('ØªÙ… Ø§Ù„Ø±ÙØ¹', 'ØªÙ… Ø±ÙØ¹ Ø§Ù„Ø£Ø¯Ù„Ø© Ø¨Ù†Ø¬Ø§Ø­');
                if (this.order) this.loadHistory(this.order.id);
            },
            error: () => { this.isSubmitting = false; },
        });
    }

    getTimeAgo(timestamp: string): string {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Ù…Ù†Ø° ${mins} Ø¯Ù‚ÙŠÙ‚Ø©`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Ù…Ù†Ø° ${hours} Ø³Ø§Ø¹Ø©`;
        const days = Math.floor(hours / 24);
        return `Ù…Ù†Ø° ${days} ÙŠÙˆÙ…`;
    }
}
