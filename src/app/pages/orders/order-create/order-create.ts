import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { OrdersService } from '../../../services/orders.service';
import { BranchesService } from '../../../services/branches.service';
import { DepartmentsService } from '../../../services/departments.service';
import { ApiBranch, ApiDepartment, AddOrderDto, ApiOrderStatus, ApiPriority } from '../../../models/api-models';
import { LucideAngularModule, ArrowRight, Save, Send } from 'lucide-angular';

@Component({
    selector: 'app-order-create',
    standalone: true,
    imports: [FormsModule, LucideAngularModule],
    templateUrl: './order-create.html',
})
export class OrderCreate implements OnInit {
    readonly ArrowRight = ArrowRight;
    readonly Save = Save;
    readonly Send = Send;

    // API data
    branches: ApiBranch[] = [];
    apiDepartments: ApiDepartment[] = [];
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
    };

    isSubmitting = false;

    constructor(
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private ordersApi: OrdersService,
        private branchesApi: BranchesService,
        private departmentsApi: DepartmentsService,
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
            },
            error: () => { },
        });
    }

    loadDepartments(branchId: number) {
        this.departmentsApi.getByBranch(branchId).subscribe({
            next: (depts) => { this.apiDepartments = depts; },
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
            priority: ApiPriority.Normal,
            branchId: this.selectedBranchId || 1,
            departmentId: parseInt(this.form.departmentId) || 0,
            createdByUserId: parseInt(this.auth.user()?.id ?? '0') || 0,
            items: null,
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
