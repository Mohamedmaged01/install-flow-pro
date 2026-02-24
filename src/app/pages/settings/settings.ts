import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { BranchesService } from '../../services/branches.service';
import { DepartmentsService } from '../../services/departments.service';
import {
    ApiBranch, ApiDepartment, ApiDepartmentUser,
    AddBranchDto, AddDepartmentDto, ApiRole
} from '../../models/api-models';
import {
    LucideAngularModule, Settings as SettingsIcon, Building, Users,
    Bell, Shield, Clock, Plus, User, Mail, Phone, Lock, X, ImageIcon, Eye, EyeOff
} from 'lucide-angular';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './settings.html',
})
export class Settings implements OnInit {
    readonly SettingsIcon = SettingsIcon;
    readonly Building = Building;
    readonly UsersIcon = Users;
    readonly Bell = Bell;
    readonly Shield = Shield;
    readonly ClockIcon = Clock;
    readonly Plus = Plus;
    readonly UserIcon = User;
    readonly MailIcon = Mail;
    readonly PhoneIcon = Phone;
    readonly LockIcon = Lock;
    readonly XIcon = X;
    readonly ImageIcon = ImageIcon;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab: 'departments' | 'users' | 'notifications' | 'sla' | 'branches' = 'branches';

    // ─── Branches / Departments ───
    branches: ApiBranch[] = [];
    apiDepartments: ApiDepartment[] = [];
    selectedBranchId: number = 0;
    isLoading = false;
    newBranch: AddBranchDto = { name: '', email: '', phone: '' };
    newDeptName = '';
    showAddBranch = false;
    showAddDept = false;

    // ─── Users ───
    users: ApiDepartmentUser[] = [];
    isLoadingUsers = false;
    showAddUser = false;
    isCreatingUser = false;
    showPassword = false;
    selectedUserDeptId: number = 0;
    selectedUserFile: File | null = null;

    newUser = {
        name: '',
        email: '',
        phone: '',
        password: '',
        role: ApiRole.Technician,
    };

    readonly roleOptions = [
        { value: ApiRole.SuperAdmin, label: 'مدير عام' },
        { value: ApiRole.Admin, label: 'مدير النظام' },
        { value: ApiRole.SalesManager, label: 'مدير المبيعات' },
        { value: ApiRole.Supervisor, label: 'مشرف التركيب' },
        { value: ApiRole.SalesRepresentative, label: 'مندوب مبيعات' },
        { value: ApiRole.Technician, label: 'فني / مهندس' },
        { value: ApiRole.Customer, label: 'عميل' },
    ];

    // ─── Notification / SLA ───
    slaSettings = {
        maxResponseHours: 4,
        maxCompletionDays: 7,
        escalationHours: 24,
        autoReassignOnDelay: true,
        qrExpiryDays: 30,
    };

    notificationSettings = {
        emailEnabled: true,
        whatsappEnabled: true,
        sendOnApproval: true,
        sendOnAssignment: true,
        sendOnCompletion: true,
        sendOnReturn: true,
        sendQRToCustomer: true,
    };

    returnReasons = [
        'بيانات ناقصة',
        'عنوان غير صحيح',
        'تعارض في الجدول',
        'يحتاج موافقة إضافية',
        'تغيير في نطاق العمل',
    ];

    constructor(
        private toast: ToastService,
        private branchesApi: BranchesService,
        private departmentsApi: DepartmentsService,
    ) { }

    ngOnInit() {
        this.loadBranches();
    }

    // ─── Branches ───
    loadBranches() {
        this.isLoading = true;
        this.branchesApi.getAll().subscribe({
            next: (branches) => {
                this.branches = branches;
                this.isLoading = false;
                if (branches.length > 0 && !this.selectedBranchId) {
                    this.selectedBranchId = branches[0].id;
                    this.loadDepartments(this.selectedBranchId);
                }
            },
            error: () => { this.isLoading = false; }
        });
    }

    loadDepartments(branchId: number) {
        this.departmentsApi.getByBranch(branchId).subscribe({
            next: (depts) => {
                this.apiDepartments = depts;
                if (depts.length > 0) {
                    this.selectedUserDeptId = depts[0].id;
                    this.loadUsers();
                }
            },
            error: () => { }
        });
    }

    onBranchSelect(branchId: number) {
        this.selectedBranchId = branchId;
        this.users = [];
        this.loadDepartments(branchId);
    }

    createBranch() {
        if (!this.newBranch.name.trim()) return;
        this.branchesApi.create(this.newBranch).subscribe({
            next: () => {
                this.toast.success('تم الإنشاء', `تم إنشاء الفرع "${this.newBranch.name}" بنجاح`);
                this.newBranch = { name: '', email: '', phone: '' };
                this.showAddBranch = false;
                this.loadBranches();
            },
            error: () => { }
        });
    }

    createDepartment() {
        if (!this.newDeptName.trim() || !this.selectedBranchId) return;
        const dto: AddDepartmentDto = { branchId: this.selectedBranchId, name: this.newDeptName };
        this.departmentsApi.create(dto).subscribe({
            next: () => {
                this.toast.success('تم الإنشاء', `تم إنشاء القسم "${this.newDeptName}" بنجاح`);
                this.newDeptName = '';
                this.showAddDept = false;
                this.loadDepartments(this.selectedBranchId);
                this.loadBranches();
            },
            error: () => { }
        });
    }

    // ─── Users ───
    loadUsers() {
        if (!this.selectedBranchId || !this.selectedUserDeptId) return;
        this.isLoadingUsers = true;
        this.departmentsApi.getUsers(this.selectedBranchId, this.selectedUserDeptId).subscribe({
            next: (users) => {
                this.users = users;
                this.isLoadingUsers = false;
            },
            error: () => { this.isLoadingUsers = false; }
        });
    }

    onDeptSelectForUsers(deptId: number) {
        this.selectedUserDeptId = deptId;
        this.loadUsers();
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.selectedUserFile = input.files[0];
        }
    }

    resetAddUserForm() {
        this.newUser = { name: '', email: '', phone: '', password: '', role: ApiRole.Technician };
        this.selectedUserFile = null;
        this.showPassword = false;
        this.showAddUser = false;
    }

    createUser() {
        if (!this.newUser.name.trim() || !this.newUser.email.trim() ||
            !this.newUser.phone.trim() || !this.newUser.password.trim()) {
            this.toast.error('بيانات ناقصة', 'يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        if (!this.selectedUserDeptId) {
            this.toast.error('خطأ', 'يرجى اختيار قسم');
            return;
        }

        const formData = new FormData();
        formData.append('DepartmentId', String(this.selectedUserDeptId));
        formData.append('Name', this.newUser.name);
        formData.append('Email', this.newUser.email);
        formData.append('Phone', this.newUser.phone);
        formData.append('Password', this.newUser.password);
        formData.append('Role', this.newUser.role);
        if (this.selectedUserFile) {
            formData.append('Image', this.selectedUserFile);
        }

        this.isCreatingUser = true;
        this.departmentsApi.addUser(formData).subscribe({
            next: () => {
                this.toast.success('تم الإنشاء', `تم إضافة المستخدم "${this.newUser.name}" بنجاح`);
                this.resetAddUserForm();
                this.isCreatingUser = false;
                this.loadUsers();
            },
            error: () => { this.isCreatingUser = false; }
        });
    }

    getRoleLabelAr(role: ApiRole): string {
        return this.roleOptions.find(r => r.value === role)?.label ?? role;
    }

    getRoleColor(role: ApiRole): string {
        const map: Record<string, string> = {
            [ApiRole.SuperAdmin]: 'bg-red-100 text-red-700',
            [ApiRole.Admin]: 'bg-purple-100 text-purple-700',
            [ApiRole.SalesManager]: 'bg-emerald-100 text-emerald-700',
            [ApiRole.Supervisor]: 'bg-indigo-100 text-indigo-700',
            [ApiRole.SalesRepresentative]: 'bg-blue-100 text-blue-700',
            [ApiRole.Technician]: 'bg-amber-100 text-amber-700',
            [ApiRole.Customer]: 'bg-slate-100 text-slate-600',
        };
        return map[role] ?? 'bg-slate-100 text-slate-600';
    }

    saveSettings() {
        this.toast.success('تم الحفظ', 'تم حفظ الإعدادات بنجاح');
    }

    getDepartmentName(deptId: number): string {
        return this.apiDepartments.find(d => d.id === deptId)?.name ?? '—';
    }
}
