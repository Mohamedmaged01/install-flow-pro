import { Injectable } from '@angular/core';
import {
    User, UserRole, Department, SalesDocument, DocumentType,
    InstallationOrder, OrderStatus, Priority, TaskAssignment,
    TaskStatus, AuditEntry, QRVerificationEvent, AppNotification,
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

    private static readonly ORDERS_KEY = 'mock_orders';
    private static readonly DOCUMENTS_KEY = 'mock_documents';


    // ===== USERS =====
    readonly users: User[] = [
        { id: 'u1', name: 'أحمد الشمري', email: 'ahmed@company.com', role: UserRole.SALES_REP, phone: '0501234567' },
        { id: 'u2', name: 'محمد ماجد', email: 'mohammed@company.com', role: UserRole.SALES_MANAGER, phone: '0509876543' },
        { id: 'u3', name: 'خالد العتيبي', email: 'khaled@company.com', role: UserRole.SUPERVISOR, department: 'd1', phone: '0507654321' },
        { id: 'u4', name: 'سعيد الحربي', email: 'saeed@company.com', role: UserRole.SUPERVISOR, department: 'd2', phone: '0503216547' },
        { id: 'u5', name: 'عبدالله القحطاني', email: 'abdullah@company.com', role: UserRole.TECHNICIAN, department: 'd1', phone: '0504567890' },
        { id: 'u6', name: 'فهد المالكي', email: 'fahad@company.com', role: UserRole.TECHNICIAN, department: 'd1', phone: '0506789012' },
        { id: 'u7', name: 'ياسر الغامدي', email: 'yaser@company.com', role: UserRole.TECHNICIAN, department: 'd2', phone: '0508901234' },
        { id: 'u8', name: 'المدير العام', email: 'admin@company.com', role: UserRole.ADMIN, phone: '0500000001' },
    ];

    // ===== DEPARTMENTS =====
    readonly departments: Department[] = [
        { id: 'd1', name: 'أنظمة أمنية', supervisorId: 'u3', color: '#3b82f6' },
        { id: 'd2', name: 'بوابات وتحكم', supervisorId: 'u4', color: '#10b981' },
        { id: 'd3', name: 'شبكات', supervisorId: 'u3', color: '#8b5cf6' },
        { id: 'd4', name: 'برامج وتطبيقات', supervisorId: 'u4', color: '#f59e0b' },
    ];

    // ===== SALES DOCUMENTS =====
    documents: SalesDocument[] = [
        {
            id: 'doc1', number: 'QT-2025-001', type: DocumentType.QUOTATION,
            customerName: 'شركة النور للتقنية', customerEmail: 'info@alnoor.com', customerPhone: '0112345678',
            items: [
                { description: 'تركيب كاميرات مراقبة 16 كاميرا', quantity: 1, unitPrice: 15000, total: 15000, serviceType: 'أنظمة أمنية' },
                { description: 'جهاز تسجيل NVR 32 قناة', quantity: 1, unitPrice: 5000, total: 5000, serviceType: 'أنظمة أمنية' },
            ],
            totalAmount: 20000, date: '2025-02-01', status: 'accepted', createdBy: 'u1', hasOrder: true, orderId: 'ord1',
        },
        {
            id: 'doc2', number: 'INV-2025-012', type: DocumentType.INVOICE,
            customerName: 'فندق الماسة', customerEmail: 'ops@almasa.com', customerPhone: '0119876543',
            items: [
                { description: 'نظام بوابات إلكترونية - 3 بوابات', quantity: 3, unitPrice: 8000, total: 24000, serviceType: 'بوابات وتحكم' },
            ],
            totalAmount: 24000, date: '2025-02-05', status: 'sent', createdBy: 'u1', hasOrder: true, orderId: 'ord2',
        },
        {
            id: 'doc3', number: 'QT-2025-003', type: DocumentType.QUOTATION,
            customerName: 'مدرسة الإبداع', customerEmail: 'admin@ibdaa.edu', customerPhone: '0113456789',
            items: [
                { description: 'تركيب شبكة داخلية - 50 نقطة', quantity: 1, unitPrice: 12000, total: 12000, serviceType: 'شبكات' },
                { description: 'خادم رئيسي', quantity: 1, unitPrice: 8000, total: 8000, serviceType: 'شبكات' },
            ],
            totalAmount: 20000, date: '2025-02-08', status: 'accepted', createdBy: 'u1', hasOrder: true, orderId: 'ord3',
        },
        {
            id: 'doc4', number: 'QT-2025-004', type: DocumentType.QUOTATION,
            customerName: 'متجر الرياض', customerEmail: 'info@riyadhstore.com', customerPhone: '0114567890',
            items: [
                { description: 'نظام نقاط بيع - 5 أجهزة', quantity: 5, unitPrice: 3000, total: 15000, serviceType: 'برامج وتطبيقات' },
            ],
            totalAmount: 15000, date: '2025-02-10', status: 'accepted', createdBy: 'u1', hasOrder: false,
        },
        {
            id: 'doc5', number: 'INV-2025-015', type: DocumentType.INVOICE,
            customerName: 'مستشفى الشفاء', customerEmail: 'it@shifa.med', customerPhone: '0115678901',
            items: [
                { description: 'تركيب كاميرات مراقبة - 32 كاميرا', quantity: 1, unitPrice: 28000, total: 28000, serviceType: 'أنظمة أمنية' },
                { description: 'نظام إنذار حريق', quantity: 1, unitPrice: 12000, total: 12000, serviceType: 'أنظمة أمنية' },
            ],
            totalAmount: 40000, date: '2025-02-12', status: 'accepted', createdBy: 'u1', hasOrder: false,
        },
    ];

    // ===== INSTALLATION ORDERS =====
    orders: InstallationOrder[] = [
        {
            id: 'ord1', orderNumber: 'IO-2025-001', documentId: 'doc1', documentNumber: 'QT-2025-001',
            documentType: DocumentType.QUOTATION, customerName: 'شركة النور للتقنية',
            customerEmail: 'info@alnoor.com', customerPhone: '0112345678',
            departmentId: 'd1', departmentName: 'أنظمة أمنية', serviceType: 'كاميرات مراقبة',
            description: 'تركيب نظام كاميرات مراقبة 16 كاميرا مع جهاز تسجيل',
            items: [
                { description: 'تركيب كاميرات مراقبة 16 كاميرا', quantity: 1, serviceType: 'أنظمة أمنية' },
                { description: 'جهاز تسجيل NVR 32 قناة', quantity: 1, serviceType: 'أنظمة أمنية' },
            ],
            status: OrderStatus.IN_PROGRESS, priority: Priority.HIGH,
            qrToken: 'QR-ABC123-XYZ', qrExpiry: '2025-03-15',
            assignedSupervisor: 'u3', supervisorName: 'خالد العتيبي',
            assignedTechnician: 'u5', technicianName: 'عبدالله القحطاني',
            createdBy: 'u1', createdByName: 'أحمد الشمري',
            createdAt: '2025-02-01T10:00:00', updatedAt: '2025-02-10T14:30:00',
            scheduledDate: '2025-02-10', scheduledTime: '09:00',
            location: 'حي العليا، شارع التحلية', city: 'الرياض',
            notes: 'يرجى التنسيق مع قسم تقنية المعلومات في الشركة',
            attachments: [], totalAmount: 20000,
            auditLog: [
                { id: 'a1', action: 'تم إنشاء الأمر', fromStatus: undefined, toStatus: OrderStatus.DRAFT, userId: 'u1', userName: 'أحمد الشمري', userRole: UserRole.SALES_REP, timestamp: '2025-02-01T10:00:00' },
                { id: 'a2', action: 'تم إرسال للموافقة', fromStatus: OrderStatus.DRAFT, toStatus: OrderStatus.PENDING_APPROVAL, userId: 'u1', userName: 'أحمد الشمري', userRole: UserRole.SALES_REP, timestamp: '2025-02-01T10:15:00' },
                { id: 'a3', action: 'تمت الموافقة', fromStatus: OrderStatus.PENDING_APPROVAL, toStatus: OrderStatus.APPROVED, userId: 'u2', userName: 'محمد ماجد', userRole: UserRole.SALES_MANAGER, timestamp: '2025-02-02T09:00:00', notes: 'موافق - أولوية عالية' },
                { id: 'a4', action: 'تم التوجيه للمشرف', fromStatus: OrderStatus.APPROVED, toStatus: OrderStatus.UNDER_REVIEW, userId: 'u2', userName: 'النظام', userRole: UserRole.ADMIN, timestamp: '2025-02-02T09:01:00' },
                { id: 'a5', action: 'تم تعيين فني', fromStatus: OrderStatus.UNDER_REVIEW, toStatus: OrderStatus.ASSIGNED, userId: 'u3', userName: 'خالد العتيبي', userRole: UserRole.SUPERVISOR, timestamp: '2025-02-05T11:00:00', notes: 'تم تعيين عبدالله القحطاني' },
                { id: 'a6', action: 'بدء التنفيذ', fromStatus: OrderStatus.ASSIGNED, toStatus: OrderStatus.IN_PROGRESS, userId: 'u5', userName: 'عبدالله القحطاني', userRole: UserRole.TECHNICIAN, timestamp: '2025-02-10T09:30:00' },
            ],
        },
        {
            id: 'ord2', orderNumber: 'IO-2025-002', documentId: 'doc2', documentNumber: 'INV-2025-012',
            documentType: DocumentType.INVOICE, customerName: 'فندق الماسة',
            customerEmail: 'ops@almasa.com', customerPhone: '0119876543',
            departmentId: 'd2', departmentName: 'بوابات وتحكم', serviceType: 'بوابات إلكترونية',
            description: 'تركيب 3 بوابات إلكترونية للمدخل الرئيسي',
            items: [{ description: 'بوابة إلكترونية', quantity: 3, serviceType: 'بوابات وتحكم' }],
            status: OrderStatus.PENDING_APPROVAL, priority: Priority.MEDIUM,
            createdBy: 'u1', createdByName: 'أحمد الشمري',
            createdAt: '2025-02-05T14:00:00', updatedAt: '2025-02-05T14:00:00',
            location: 'كورنيش الخبر', city: 'الخبر',
            attachments: [], totalAmount: 24000,
            auditLog: [
                { id: 'a7', action: 'تم إنشاء الأمر', fromStatus: undefined, toStatus: OrderStatus.DRAFT, userId: 'u1', userName: 'أحمد الشمري', userRole: UserRole.SALES_REP, timestamp: '2025-02-05T14:00:00' },
                { id: 'a8', action: 'تم إرسال للموافقة', fromStatus: OrderStatus.DRAFT, toStatus: OrderStatus.PENDING_APPROVAL, userId: 'u1', userName: 'أحمد الشمري', userRole: UserRole.SALES_REP, timestamp: '2025-02-05T14:10:00' },
            ],
        },
        {
            id: 'ord3', orderNumber: 'IO-2025-003', documentId: 'doc3', documentNumber: 'QT-2025-003',
            documentType: DocumentType.QUOTATION, customerName: 'مدرسة الإبداع',
            customerEmail: 'admin@ibdaa.edu', customerPhone: '0113456789',
            departmentId: 'd3', departmentName: 'شبكات', serviceType: 'شبكات داخلية',
            description: 'تركيب شبكة داخلية 50 نقطة مع خادم رئيسي',
            items: [
                { description: 'شبكة داخلية - 50 نقطة', quantity: 1, serviceType: 'شبكات' },
                { description: 'خادم رئيسي', quantity: 1, serviceType: 'شبكات' },
            ],
            status: OrderStatus.COMPLETED, priority: Priority.URGENT,
            qrToken: 'QR-DEF456-ABC', qrExpiry: '2025-03-20',
            assignedSupervisor: 'u3', supervisorName: 'خالد العتيبي',
            assignedTechnician: 'u6', technicianName: 'فهد المالكي',
            createdBy: 'u1', createdByName: 'أحمد الشمري',
            createdAt: '2025-02-08T08:00:00', updatedAt: '2025-02-14T16:00:00',
            scheduledDate: '2025-02-12', scheduledTime: '08:00',
            location: 'حي الملقا', city: 'الرياض',
            attachments: [], totalAmount: 20000,
            auditLog: [
                { id: 'a9', action: 'تم إنشاء الأمر', fromStatus: undefined, toStatus: OrderStatus.DRAFT, userId: 'u1', userName: 'أحمد الشمري', userRole: UserRole.SALES_REP, timestamp: '2025-02-08T08:00:00' },
                { id: 'a10', action: 'تم إرسال للموافقة', fromStatus: OrderStatus.DRAFT, toStatus: OrderStatus.PENDING_APPROVAL, userId: 'u1', userName: 'أحمد الشمري', userRole: UserRole.SALES_REP, timestamp: '2025-02-08T08:30:00' },
                { id: 'a11', action: 'تمت الموافقة', fromStatus: OrderStatus.PENDING_APPROVAL, toStatus: OrderStatus.APPROVED, userId: 'u2', userName: 'محمد ماجد', userRole: UserRole.SALES_MANAGER, timestamp: '2025-02-08T10:00:00' },
                { id: 'a12', action: 'تم تعيين فني', fromStatus: OrderStatus.APPROVED, toStatus: OrderStatus.ASSIGNED, userId: 'u3', userName: 'خالد العتيبي', userRole: UserRole.SUPERVISOR, timestamp: '2025-02-09T09:00:00' },
                { id: 'a13', action: 'بدء التنفيذ', fromStatus: OrderStatus.ASSIGNED, toStatus: OrderStatus.IN_PROGRESS, userId: 'u6', userName: 'فهد المالكي', userRole: UserRole.TECHNICIAN, timestamp: '2025-02-12T08:15:00' },
                { id: 'a14', action: 'تم إكمال العمل', fromStatus: OrderStatus.IN_PROGRESS, toStatus: OrderStatus.COMPLETED, userId: 'u6', userName: 'فهد المالكي', userRole: UserRole.TECHNICIAN, timestamp: '2025-02-14T16:00:00' },
            ],
        },
    ];

    // ===== TASK ASSIGNMENTS =====
    readonly tasks: TaskAssignment[] = [
        {
            id: 't1', orderId: 'ord1', orderNumber: 'IO-2025-001',
            customerName: 'شركة النور للتقنية', assignedTo: 'u5', technicianName: 'عبدالله القحطاني',
            status: TaskStatus.IN_PROGRESS, startTime: '2025-02-10T09:30:00',
            location: 'حي العليا، شارع التحلية', city: 'الرياض',
            serviceType: 'كاميرات مراقبة', departmentName: 'أنظمة أمنية',
            priority: Priority.HIGH, scheduledDate: '2025-02-10', scheduledTime: '09:00',
            notes: 'التنسيق مع قسم IT', attachments: [],
        },
        {
            id: 't2', orderId: 'ord3', orderNumber: 'IO-2025-003',
            customerName: 'مدرسة الإبداع', assignedTo: 'u6', technicianName: 'فهد المالكي',
            status: TaskStatus.COMPLETED, startTime: '2025-02-12T08:15:00', endTime: '2025-02-14T16:00:00',
            location: 'حي الملقا', city: 'الرياض',
            serviceType: 'شبكات داخلية', departmentName: 'شبكات',
            priority: Priority.URGENT, scheduledDate: '2025-02-12', scheduledTime: '08:00',
            attachments: [],
        },
    ];

    // ===== NOTIFICATIONS =====
    notifications: AppNotification[] = [
        { id: 'n1', title: 'أمر تركيب جديد', message: 'تم إنشاء أمر تركيب جديد IO-2025-002 بانتظار موافقتك', type: 'warning', orderId: 'ord2', read: false, timestamp: '2025-02-05T14:10:00', targetRole: UserRole.SALES_MANAGER },
        { id: 'n2', title: 'تم الموافقة على الأمر', message: 'تمت الموافقة على أمر التركيب IO-2025-001', type: 'success', orderId: 'ord1', read: true, timestamp: '2025-02-02T09:00:00', targetUserId: 'u1' },
        { id: 'n3', title: 'مهمة جديدة', message: 'تم تعيينك على أمر التركيب IO-2025-001', type: 'info', orderId: 'ord1', read: true, timestamp: '2025-02-05T11:00:00', targetUserId: 'u5' },
        { id: 'n4', title: 'أمر مكتمل', message: 'تم إكمال العمل في أمر IO-2025-003 بانتظار تأكيد QR', type: 'success', orderId: 'ord3', read: false, timestamp: '2025-02-14T16:00:00', targetRole: UserRole.SALES_MANAGER },
    ];

    // ===== QR EVENTS =====
    readonly qrEvents: QRVerificationEvent[] = [
        {
            id: 'qr1', orderId: 'ord3', orderNumber: 'IO-2025-003',
            scannedBy: 'u6', scannedByName: 'فهد المالكي',
            scanTime: '2025-02-14T16:05:00', location: 'حي الملقا، الرياض',
            result: 'success',
        },
    ];

    // ===== CONSTRUCTOR — restore persisted data =====
    constructor() {
        this.loadPersistedOrders();
        this.loadPersistedDocuments();
    }

    // ===== PERSISTENCE =====

    private loadPersistedOrders() {
        if (typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(MockDataService.ORDERS_KEY);
        if (!raw) return;
        try {
            const saved: InstallationOrder[] = JSON.parse(raw);
            // Merge: replace default entries that share an ID, then add new ones
            for (const s of saved) {
                const idx = this.orders.findIndex(o => o.id === s.id);
                if (idx >= 0) {
                    this.orders[idx] = s;
                } else {
                    this.orders.push(s);
                }
            }
        } catch { }
    }

    private loadPersistedDocuments() {
        if (typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(MockDataService.DOCUMENTS_KEY);
        if (!raw) return;
        try {
            const saved: SalesDocument[] = JSON.parse(raw);
            for (const s of saved) {
                const idx = this.documents.findIndex(d => d.id === s.id);
                if (idx >= 0) {
                    this.documents[idx] = s;
                }
            }
        } catch { }
    }

    private saveOrders() {
        if (typeof localStorage === 'undefined') return;
        // Only persist orders that were added or modified (not the hardcoded defaults)
        localStorage.setItem(MockDataService.ORDERS_KEY, JSON.stringify(this.orders));
    }

    private saveDocuments() {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(MockDataService.DOCUMENTS_KEY, JSON.stringify(this.documents));
    }

    /** Add a new order and persist to localStorage */
    addOrder(order: InstallationOrder) {
        this.orders.push(order);
        this.saveOrders();
    }

    /** Update a document (e.g. mark hasOrder) and persist to localStorage */
    updateDocument(docId: string, changes: Partial<SalesDocument>) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc) {
            Object.assign(doc, changes);
            this.saveDocuments();
        }
    }

    // ===== HELPER METHODS =====

    getOrdersByStatus(status: OrderStatus): InstallationOrder[] {
        return this.orders.filter(o => o.status === status);
    }

    getOrderById(id: string): InstallationOrder | undefined {
        return this.orders.find(o => o.id === id);
    }

    getDocumentById(id: string): SalesDocument | undefined {
        return this.documents.find(d => d.id === id);
    }

    getUserById(id: string): User | undefined {
        return this.users.find(u => u.id === id);
    }

    getUsersByRole(role: UserRole): User[] {
        return this.users.filter(u => u.role === role);
    }

    getTechniciansByDepartment(deptId: string): User[] {
        return this.users.filter(u => u.role === UserRole.TECHNICIAN && u.department === deptId);
    }

    getTasksByTechnician(userId: string): TaskAssignment[] {
        return this.tasks.filter(t => t.assignedTo === userId);
    }

    getNotificationsForUser(userId: string, role: UserRole): AppNotification[] {
        return this.notifications.filter(n =>
            n.targetUserId === userId || n.targetRole === role
        );
    }

    getUnreadCount(userId: string, role: UserRole): number {
        return this.getNotificationsForUser(userId, role).filter(n => !n.read).length;
    }

    generateOrderNumber(): string {
        const count = this.orders.length + 1;
        return `IO-2025-${String(count).padStart(3, '0')}`;
    }

    generateQRToken(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = 'QR-';
        for (let i = 0; i < 6; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
        token += '-';
        for (let i = 0; i < 3; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
        return token;
    }
}
