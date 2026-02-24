import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserRole, ROLE_LABELS } from '../../models';
import { LucideAngularModule, Shield, Users, ClipboardList, Wrench, Settings, LogIn, Phone, Lock, ChevronDown, ChevronUp } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LucideAngularModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      <!-- Decorative blobs -->
      <div class="fixed inset-0 pointer-events-none -z-10">
        <div class="absolute -top-24 -right-24 w-[600px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-indigo-400/10 blur-[120px] rounded-full"></div>
      </div>
      
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
            <lucide-icon [name]="ClipboardList" class="size-8 text-white"></lucide-icon>
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">InstallFlow Pro</h1>
          <p class="text-slate-400 mt-2">نظام إدارة أوامر التركيب</p>
        </div>

        <!-- Login Form -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-100/50">
          <h2 class="text-lg font-bold text-slate-800 mb-1">تسجيل الدخول</h2>
          <p class="text-sm text-slate-400 mb-6">أدخل بيانات الدخول الخاصة بك</p>
          
          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1.5">رقم الهاتف / البريد الإلكتروني</label>
              <div class="relative">
                <lucide-icon [name]="Phone" class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"></lucide-icon>
                <input type="text" [(ngModel)]="phoneOrEmail" name="phoneOrEmail" required
                  placeholder="05xxxxxxxx أو email@example.com"
                  class="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  [class.border-red-300]="loginError">
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1.5">كلمة المرور</label>
              <div class="relative">
                <lucide-icon [name]="Lock" class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"></lucide-icon>
                <input type="password" [(ngModel)]="password" name="password" required
                  placeholder="••••••••"
                  class="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  [class.border-red-300]="loginError">
              </div>
            </div>

            @if (loginError) {
            <div class="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
              {{ loginError }}
            </div>
            }

            <button type="submit" [disabled]="isLoading"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer">
              @if (isLoading) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              جاري تسجيل الدخول...
              } @else {
              <lucide-icon [name]="LogIn" class="size-4"></lucide-icon>
              تسجيل الدخول
              }
            </button>
          </form>
        </div>

        <!-- Demo Quick Login (collapsible) -->
        <div class="mt-4">
          <button (click)="showDemoRoles = !showDemoRoles"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <lucide-icon [name]="showDemoRoles ? ChevronUp : ChevronDown" class="size-3.5"></lucide-icon>
            دخول تجريبي (بدون حساب)
          </button>

          @if (showDemoRoles) {
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mt-2 shadow-sm border border-slate-100/50 space-y-2">
            @for (role of roles; track role.value) {
              <button (click)="loginAs(role.value)"
                class="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 group cursor-pointer text-right">
                <div [class]="'w-9 h-9 rounded-lg flex items-center justify-center ' + role.bgClass + ' group-hover:scale-110 transition-transform duration-200'">
                  <lucide-icon [name]="role.icon" class="size-4 text-white"></lucide-icon>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{{ role.label }}</h3>
                  <p class="text-[10px] text-slate-400">{{ role.desc }}</p>
                </div>
              </button>
            }
          </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Login {
  readonly ClipboardList = ClipboardList;
  readonly LogIn = LogIn;
  readonly Phone = Phone;
  readonly Lock = Lock;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;

  phoneOrEmail = '';
  password = '';
  loginError = '';
  isLoading = false;
  showDemoRoles = false;

  roles = [
    { value: UserRole.SALES_REP, label: 'مندوب مبيعات', desc: 'إنشاء ومتابعة أوامر التركيب', icon: Users, bgClass: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { value: UserRole.SALES_MANAGER, label: 'مدير المبيعات', desc: 'الموافقة على أوامر التركيب', icon: Shield, bgClass: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
    { value: UserRole.SUPERVISOR, label: 'مشرف التركيب', desc: 'تعيين الفنيين ومتابعة الأوامر', icon: ClipboardList, bgClass: 'bg-gradient-to-br from-purple-500 to-purple-700' },
    { value: UserRole.TECHNICIAN, label: 'فني / مهندس', desc: 'تنفيذ أوامر التركيب', icon: Wrench, bgClass: 'bg-gradient-to-br from-amber-500 to-amber-700' },
    { value: UserRole.ADMIN, label: 'مدير النظام', desc: 'إدارة الإعدادات والصلاحيات', icon: Settings, bgClass: 'bg-gradient-to-br from-slate-600 to-slate-800' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    if (!this.phoneOrEmail.trim() || !this.password.trim()) {
      this.loginError = 'يرجى إدخال رقم الهاتف / البريد وكلمة المرور';
      return;
    }
    this.loginError = '';
    this.isLoading = true;

    this.auth.apiLogin(this.phoneOrEmail, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.toast.success('مرحباً', 'تم تسجيل الدخول بنجاح');
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = 'رقم الهاتف أو كلمة المرور غير صحيحة';
        }
      },
      error: () => {
        this.isLoading = false;
        this.loginError = 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً';
      },
    });
  }

  loginAs(role: UserRole): void {
    this.auth.loginAs(role);
    this.router.navigate(['/dashboard']);
  }
}
