import { Component } from '@angular/core';
import { LucideAngularModule, Search, Bell, Mail, Menu, LogOut } from 'lucide-angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './header.html',
  styles: ``,
})
export class Header {
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Mail = Mail;
  readonly Menu = Menu;
  readonly LogOut = LogOut;

  constructor(
    public auth: AuthService,
    public data: MockDataService,
    private router: Router,
  ) { }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get unreadCount(): number {
    const user = this.auth.user();
    const role = this.auth.userRole();
    if (!user || !role) return 0;
    return this.data.getUnreadCount(user.id, role);
  }
}
