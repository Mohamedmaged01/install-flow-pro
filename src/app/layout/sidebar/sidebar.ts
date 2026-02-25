import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import {
  LucideAngularModule, LayoutDashboard, FileText, ClipboardList,
  Calendar, QrCode, BarChart3, Settings, LogOut, MoreVertical, CheckSquare
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models';

interface MenuItem {
  label: string;
  icon: any;
  route: string;
  roles: UserRole[] | 'all';
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, route: '/dashboard', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
  { label: 'المستندات', icon: FileText, route: '/documents', roles: [UserRole.ADMIN, UserRole.SALES_REP, UserRole.SALES_MANAGER] },
  { label: 'أوامر التركيب', icon: ClipboardList, route: '/jobs', roles: 'all' },
  { label: 'مهامي', icon: CheckSquare, route: '/tasks', roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.ADMIN] },
  { label: 'الجدول', icon: Calendar, route: '/schedule', roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.ADMIN] },
  { label: 'مسح QR', icon: QrCode, route: '/scan-qr', roles: [UserRole.TECHNICIAN, UserRole.ADMIN] },
  { label: 'التقارير', icon: BarChart3, route: '/reports', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
  { label: 'الإعدادات', icon: Settings, route: '/settings', roles: [UserRole.ADMIN] },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {
  readonly MoreVertical = MoreVertical;
  readonly LogOut = LogOut;

  readonly menuItems = computed(() => {
    const role = this.auth.userRole();
    if (!role) return [];
    return ALL_MENU_ITEMS.filter(item =>
      item.roles === 'all' || item.roles.includes(role)
    );
  });

  constructor(
    public auth: AuthService,
    private router: Router,
  ) { }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
