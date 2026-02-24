import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileText, ClipboardList, Scan, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './action-card.html',
  styles: ``,
})
export class ActionCard {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() route: string = '/';

  readonly ArrowLeft = ArrowLeft;

  get iconName(): any {
    switch (this.icon) {
      case 'file-text': return FileText;
      case 'clipboard-list': return ClipboardList;
      case 'qr-code': return Scan;
      default: return FileText;
    }
  }

  get bgClass(): string {
    switch (this.icon) {
      case 'qr-code': return 'bg-gradient-to-br from-purple-500 to-purple-700';
      case 'clipboard-list': return 'bg-gradient-to-br from-emerald-500 to-teal-600';
      default: return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    }
  }
}
