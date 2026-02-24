import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import {
  LucideAngularModule, LayoutDashboard, FileText, ClipboardList,
  Calendar, QrCode, BarChart3, Settings, LogOut, MoreVertical
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { MockDataService } from '../../services/mock-data.service';

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

  menuItems = [
    { label: 'لوحة التحكم', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'المستندات', icon: FileText, route: '/documents' },
    { label: 'أوامر التركيب', icon: ClipboardList, route: '/jobs' },
    { label: 'مهامي', icon: Calendar, route: '/schedule' },
    { label: 'مسح QR', icon: QrCode, route: '/scan-qr' },
    { label: 'التقارير', icon: BarChart3, route: '/reports' },
    { label: 'الإعدادات', icon: Settings, route: '/settings' },
  ];

  constructor(
    public auth: AuthService,
    public data: MockDataService,
    private router: Router,
  ) { }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
