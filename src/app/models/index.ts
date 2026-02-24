// ===== ENUMS =====

export enum UserRole {
    SALES_REP = 'sales_rep',
    SALES_MANAGER = 'sales_manager',
    SUPERVISOR = 'supervisor',
    TECHNICIAN = 'technician',
    ADMIN = 'admin',
}

export enum OrderStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    REJECTED = 'rejected',
    APPROVED = 'approved',
    UNDER_REVIEW = 'under_review',
    RETURNED = 'returned',
    READY_FOR_ASSIGNMENT = 'ready_for_assignment',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    RETURNED_FROM_FIELD = 'returned_from_field',
    COMPLETED = 'completed',
    PENDING_QR = 'pending_qr',
    CLOSED = 'closed',
    CANCELLED = 'cancelled',
}

export enum DocumentType {
    QUOTATION = 'quotation',
    INVOICE = 'invoice',
}

export enum TaskStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    ENROUTE = 'enroute',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    COMPLETED = 'completed',
}

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

// ===== INTERFACES =====

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    avatar?: string;
    phone?: string;
}

export interface Department {
    id: string;
    name: string;
    supervisorId: string;
    color: string;
}

export interface SalesDocument {
    id: string;
    number: string;
    type: DocumentType;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: DocumentItem[];
    totalAmount: number;
    date: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    createdBy: string;
    hasOrder: boolean;
    orderId?: string;
}

export interface DocumentItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    serviceType: string;
}

export interface InstallationOrder {
    id: string;
    orderNumber: string;
    documentId: string;
    documentNumber: string;
    documentType: DocumentType;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    departmentId: string;
    departmentName: string;
    serviceType: string;
    description: string;
    items: OrderItem[];
    status: OrderStatus;
    priority: Priority;
    qrToken?: string;
    qrExpiry?: string;
    assignedSupervisor?: string;
    assignedTechnician?: string;
    technicianName?: string;
    supervisorName?: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: string;
    city?: string;
    notes?: string;
    returnReason?: string;
    returnNotes?: string;
    returnHistory?: ReturnFeedback[];
    createdById?: string;
    attachments: Attachment[];
    auditLog: AuditEntry[];
    totalAmount: number;
}

export interface OrderItem {
    description: string;
    quantity: number;
    serviceType: string;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedAt: string;
}

export interface TaskAssignment {
    id: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    assignedTo: string;
    technicianName: string;
    status: TaskStatus;
    startTime?: string;
    endTime?: string;
    location: string;
    city: string;
    serviceType: string;
    departmentName: string;
    priority: Priority;
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
    attachments: Attachment[];
}

export interface AuditEntry {
    id: string;
    action: string;
    fromStatus?: OrderStatus;
    toStatus?: OrderStatus;
    userId: string;
    userName: string;
    userRole: UserRole;
    timestamp: string;
    notes?: string;
}

export interface QRVerificationEvent {
    id: string;
    orderId: string;
    orderNumber: string;
    scannedBy: string;
    scannedByName: string;
    scanTime: string;
    location?: string;
    result: 'success' | 'failed' | 'expired';
    evidence?: string;
}

export interface ReturnFeedback {
    id: string;
    orderId: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    reason: string;
    notes?: string;
    timestamp: string;
    resolved: boolean;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    orderId?: string;
    read: boolean;
    timestamp: string;
    targetRole?: UserRole;
    targetUserId?: string;
}


// ===== STATUS HELPERS =====

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: 'مسودة',
    [OrderStatus.PENDING_APPROVAL]: 'بانتظار الموافقة',
    [OrderStatus.REJECTED]: 'مرفوض',
    [OrderStatus.APPROVED]: 'تمت الموافقة',
    [OrderStatus.UNDER_REVIEW]: 'قيد المراجعة',
    [OrderStatus.RETURNED]: 'مُعاد للتعديل',
    [OrderStatus.READY_FOR_ASSIGNMENT]: 'جاهز للإسناد',
    [OrderStatus.ASSIGNED]: 'تم التعيين',
    [OrderStatus.IN_PROGRESS]: 'قيد التنفيذ',
    [OrderStatus.ON_HOLD]: 'معلق',
    [OrderStatus.RETURNED_FROM_FIELD]: 'مُعاد من الميدان',
    [OrderStatus.COMPLETED]: 'مكتمل',
    [OrderStatus.PENDING_QR]: 'بانتظار تأكيد QR',
    [OrderStatus.CLOSED]: 'مغلق',
    [OrderStatus.CANCELLED]: 'ملغي',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    [OrderStatus.DRAFT]: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    [OrderStatus.PENDING_APPROVAL]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    [OrderStatus.REJECTED]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    [OrderStatus.APPROVED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    [OrderStatus.UNDER_REVIEW]: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    [OrderStatus.RETURNED]: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    [OrderStatus.READY_FOR_ASSIGNMENT]: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    [OrderStatus.ASSIGNED]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    [OrderStatus.IN_PROGRESS]: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    [OrderStatus.ON_HOLD]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    [OrderStatus.RETURNED_FROM_FIELD]: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    [OrderStatus.COMPLETED]: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    [OrderStatus.PENDING_QR]: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    [OrderStatus.CLOSED]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    [OrderStatus.CANCELLED]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'معلق',
    [TaskStatus.ACCEPTED]: 'مقبول',
    [TaskStatus.ENROUTE]: 'في الطريق',
    [TaskStatus.IN_PROGRESS]: 'قيد التنفيذ',
    [TaskStatus.ON_HOLD]: 'متوقف',
    [TaskStatus.COMPLETED]: 'مكتمل',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
    [Priority.LOW]: 'منخفض',
    [Priority.MEDIUM]: 'متوسط',
    [Priority.HIGH]: 'مرتفع',
    [Priority.URGENT]: 'عاجل',
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
    [Priority.LOW]: { bg: 'bg-slate-50', text: 'text-slate-600' },
    [Priority.MEDIUM]: { bg: 'bg-blue-50', text: 'text-blue-600' },
    [Priority.HIGH]: { bg: 'bg-orange-50', text: 'text-orange-600' },
    [Priority.URGENT]: { bg: 'bg-red-50', text: 'text-red-600' },
};

export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.SALES_REP]: 'مندوب مبيعات',
    [UserRole.SALES_MANAGER]: 'مدير المبيعات',
    [UserRole.SUPERVISOR]: 'مشرف التركيب',
    [UserRole.TECHNICIAN]: 'فني / مهندس',
    [UserRole.ADMIN]: 'مدير النظام',
};
