import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Clock, MoreVertical, Play, Pause, CheckCircle } from 'lucide-angular';
import { TasksService } from '../../services/tasks.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiTask, ApiTaskStatus } from '../../models/api-models';
import { UserRole } from '../../models';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './schedule.html',
  styles: ``,
})
export class Schedule implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly MoreVertical = MoreVertical;
  readonly Play = Play;
  readonly Pause = Pause;
  readonly CheckCircle = CheckCircle;
  readonly ApiTaskStatus = ApiTaskStatus;

  activeTab: 'all' | 'in_progress' | 'pending' | 'completed' = 'all';
  allTasks: ApiTask[] = [];
  isLoading = false;

  readonly TASK_STATUS_LABELS: Record<ApiTaskStatus, string> = {
    [ApiTaskStatus.Assigned]: 'مُسنَد',
    [ApiTaskStatus.Accepted]: 'مقبول',
    [ApiTaskStatus.Enroute]: 'في الطريق',
    [ApiTaskStatus.Onsite]: 'في الموقع',
    [ApiTaskStatus.InProgress]: 'قيد التنفيذ',
    [ApiTaskStatus.Completed]: 'مكتمل',
    [ApiTaskStatus.Returned]: 'مُعاد',
    [ApiTaskStatus.OnHold]: 'متوقف',
  };

  constructor(
    private tasksService: TasksService,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.tasksService.getAll().subscribe({
      next: (tasks) => {
        const userId = parseInt(this.auth.user()?.id ?? '0');
        // Technicians see only their own tasks
        this.allTasks = this.auth.hasRole(UserRole.TECHNICIAN) && userId
          ? tasks.filter(t => t.technicianId === userId)
          : tasks;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  get tasks(): ApiTask[] {
    if (this.activeTab === 'all') return this.allTasks;
    if (this.activeTab === 'in_progress') return this.allTasks.filter(t =>
      t.status === ApiTaskStatus.InProgress || t.status === ApiTaskStatus.Accepted ||
      t.status === ApiTaskStatus.Enroute || t.status === ApiTaskStatus.Onsite);
    if (this.activeTab === 'pending') return this.allTasks.filter(t => t.status === ApiTaskStatus.Assigned);
    if (this.activeTab === 'completed') return this.allTasks.filter(t => t.status === ApiTaskStatus.Completed);
    return this.allTasks;
  }

  viewOrder(orderId: number) {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusLabel(status: ApiTaskStatus): string {
    return this.TASK_STATUS_LABELS[status] ?? status;
  }

  getStatusColor(status: ApiTaskStatus): string {
    switch (status) {
      case ApiTaskStatus.InProgress: return 'bg-blue-50 text-blue-700';
      case ApiTaskStatus.Completed: return 'bg-emerald-50 text-emerald-700';
      case ApiTaskStatus.Assigned: return 'bg-amber-50 text-amber-700';
      case ApiTaskStatus.OnHold: return 'bg-orange-50 text-orange-700';
      case ApiTaskStatus.Enroute: return 'bg-sky-50 text-sky-700';
      case ApiTaskStatus.Onsite: return 'bg-purple-50 text-purple-700';
      case ApiTaskStatus.Returned: return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  }
}

