import { Component } from '@angular/core';
import { LucideAngularModule, Search, Bell, Mail, Menu } from 'lucide-angular';
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

  constructor(
    public auth: AuthService,
    public data: MockDataService,
  ) { }

  get unreadCount(): number {
    const user = this.auth.user();
    const role = this.auth.userRole();
    if (!user || !role) return 0;
    return this.data.getUnreadCount(user.id, role);
  }
}
