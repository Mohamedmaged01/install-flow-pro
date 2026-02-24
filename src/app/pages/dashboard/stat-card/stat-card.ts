import { Component, Input } from '@angular/core';
import { LucideAngularModule, ClipboardList, Clock, Wrench, CheckCircle, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './stat-card.html',
  styles: ``,
})
export class StatCard {
  @Input() label: string = '';
  @Input() value: string = '0';
  @Input() icon: string = '';
  @Input() color: string = 'blue';

  get iconName(): any {
    switch (this.icon) {
      case 'clipboard-list': return ClipboardList;
      case 'clock': return Clock;
      case 'wrench': return Wrench;
      case 'check-circle': return CheckCircle;
      case 'alert-triangle': return AlertTriangle;
      default: return ClipboardList;
    }
  }

  get bgClass(): string {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
    };
    return colors[this.color] || colors['blue'];
  }
}
