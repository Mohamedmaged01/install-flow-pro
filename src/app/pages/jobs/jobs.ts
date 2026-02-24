import { Component } from '@angular/core';
import { LucideAngularModule, Search, Filter } from 'lucide-angular';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './jobs.html',
  styles: ``,
})
export class Jobs {
  orders = [
    { id: '1024', client: 'شركة النور للتقنية', type: 'برامج', date: '2023-10-25', status: 'pending', technician: 'محمد علي' },
    { id: '1023', client: 'فندق الماسة', type: 'أنظمة أمنية', date: '2023-10-24', status: 'completed', technician: 'أحمد حسن' },
    { id: '1022', client: 'مدرسة الإبداع', type: 'بوابات', date: '2023-10-24', status: 'in-progress', technician: 'خالد عمر' },
    { id: '1021', client: 'متجر الرياض', type: 'كاميرات', date: '2023-10-23', status: 'completed', technician: 'سعيد محمد' },
    { id: '1020', client: 'مستشفى الشفاء', type: 'شبكات', date: '2023-10-22', status: 'urgent', technician: 'فهد عبدالله' },
  ];
}
