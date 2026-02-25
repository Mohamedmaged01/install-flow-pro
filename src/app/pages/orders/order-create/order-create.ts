import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { OrdersService } from '../../../services/orders.service';
import { BranchesService } from '../../../services/branches.service';
import { DepartmentsService } from '../../../services/departments.service';
import { ItemsService } from '../../../services/items.service';
import { ApiBranch, ApiDepartment, ApiItem, AddOrderDto, ApiOrderStatus, ApiPriority, OrderItemDto } from '../../../models/api-models';
import { LucideAngularModule, ArrowRight, Save, Send, Plus, Minus, Trash2, AlertCircle } from 'lucide-angular';

@Component({
    selector: 'app-order-create',
    standalone: true,
    imports: [FormsModule, LucideAngularModule, DecimalPipe],
    templateUrl: './order-create.html',
})
export class OrderCreate implements OnInit {
    readonly ArrowRight = ArrowRight;
    readonly Save = Save;
    readonly Send = Send;
    readonly Plus = Plus;
    readonly Minus = Minus;
    readonly Trash2 = Trash2;
    readonly AlertCircle = AlertCircle;
    readonly ApiPriority = ApiPriority;

    // API data
    branches: ApiBranch[] = [];
    apiDepartments: ApiDepartment[] = [];
    availableItems: ApiItem[] = [];
    selectedBranchId: number = 0;

    form = {
        departmentId: '',
        description: '',
        scheduledDate: '',
        location: '',
        city: '',
        notes: '',
        quotationId: '',
        invoiceId: '',
        customerId: '',
        priority: ApiPriority.Normal,
    };

    // Items selected for this order: { item, qty }
    selectedItems: { item: ApiItem; qty: number }[] = [];

    isSubmitting = false;

    constructor(
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private ordersApi: OrdersService,
        private branchesApi: BranchesService,
        private departmentsApi: DepartmentsService,
        private itemsApi: ItemsService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        // Pre-populate from query params if navigating from documents
        const quotationId = this.route.snapshot.queryParams['quotationId'];
        const customerId = this.route.snapshot.queryParams['customerId'];
        if (quotationId) this.form.quotationId = quotationId;
        if (customerId) this.form.customerId = customerId;

        this.branchesApi.getAll().subscribe({
            next: (branches) => {
                this.branches = branches;
                if (branches.length > 0) {
                    this.selectedBranchId = branches[0].id;
                    this.loadDepartments(this.selectedBranchId);
                }
                this.cdr.detectChanges();
            },
            error: () => { },
        });

        this.itemsApi.getAll().subscribe({
            next: (items) => { this.availableItems = items; this.cdr.detectChanges(); },
            error: () => { },
        });
    }

    loadDepartments(branchId: number) {
        this.departmentsApi.getByBranch(branchId).subscribe({
            next: (depts) => { this.apiDepartments = depts; this.cdr.detectChanges(); },
            error: () => { },
        });
    }

    onBranchChange() {
        if (this.selectedBranchId) {
            this.loadDepartments(this.selectedBranchId);
        }
    }

    get isValid(): boolean {
        return !!(this.form.departmentId && this.form.description && this.form.scheduledDate && this.form.city);
    }

    // ─── Items management ───
    addItem(item: ApiItem) {
        const existing = this.selectedItems.find(si => si.item.id === item.id);
        if (existing) { existing.qty++; } else { this.selectedItems.push({ item, qty: 1 }); }
    }

    removeItem(itemId: number) {
        this.selectedItems = this.selectedItems.filter(si => si.item.id !== itemId);
    }

    incrementQty(itemId: number) {
        const found = this.selectedItems.find(si => si.item.id === itemId);
        if (found) found.qty = Math.min(found.qty + 1, 99);
    }

    decrementQty(itemId: number) {
        const found = this.selectedItems.find(si => si.item.id === itemId);
        if (found) {
            if (found.qty <= 1) this.removeItem(itemId);
            else found.qty--;
        }
    }

    get orderItemDtos(): OrderItemDto[] {
        return this.selectedItems.map(si => ({ id: si.item.id, qantity: si.qty }));
    }

    get totalItemsPrice(): number {
        return this.selectedItems.reduce((sum, si) => sum + si.item.price * si.qty, 0);
    }

    saveAsDraft() {
        this.submitToApi(ApiOrderStatus.Draft);
    }

    submitForApproval() {
        this.submitToApi(ApiOrderStatus.PendingSalesManager);
    }

    private submitToApi(status: ApiOrderStatus) {
        if (!this.isValid) return;
        this.isSubmitting = true;
        const dto: AddOrderDto = {
            status,
            city: this.form.city,
            address: this.form.location,
            scheduledDate: this.form.scheduledDate ? new Date(this.form.scheduledDate).toISOString() : null,
            quotationId: this.form.quotationId || '',
            invoiceId: this.form.invoiceId || '',
            customerId: this.form.customerId || '',
            createdAt: new Date().toISOString(),
            salesApprovalDate: status === ApiOrderStatus.PendingSalesManager ? new Date().toISOString() : null,
            priority: this.form.priority,
            branchId: this.selectedBranchId || 1,
            departmentId: parseInt(this.form.departmentId) || 0,
            createdByUserId: this.auth.userId(),
            items: this.orderItemDtos.length > 0 ? this.orderItemDtos : null,
        };

        this.ordersApi.create(dto).subscribe({
            next: () => {
                this.isSubmitting = false;
                if (status === ApiOrderStatus.PendingSalesManager) {
                    this.toast.success('تم الإرسال', 'تم إرسال أمر التركيب للموافقة');
                } else {
                    this.toast.info('تم الحفظ', 'تم حفظ أمر التركيب كمسودة');
                }
                this.router.navigate(['/jobs']);
            },
            error: () => {
                this.isSubmitting = false;
                this.toast.error('خطأ', 'تعذر حفظ الأمر، يرجى المحاولة مجدداً');
            },
        });
    }

    goBack() {
        this.router.navigate(['/documents']);
    }
}
