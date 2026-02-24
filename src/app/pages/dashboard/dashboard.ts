import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StatisticsService } from '../../services/statistics.service';
import { StatCard } from './stat-card/stat-card';
import { ActionCard } from './action-card/action-card';
import { ChartWidget } from './chart-widget/chart-widget';
import { RecentOrders } from './recent-orders/recent-orders';
import { LucideAngularModule, Calendar } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCard, ActionCard, ChartWidget, RecentOrders, LucideAngularModule],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  readonly CalendarIcon = Calendar;

  totalOrders = 0;
  completedOrders = 0;
  pendingOrders = 0;
  inProgressOrders = 0;
  urgentOrders = 0;
  statsLoaded = false;

  constructor(
    public auth: AuthService,
    private statisticsApi: StatisticsService,
  ) { }

  ngOnInit() {
    this.statisticsApi.get().subscribe({
      next: (stats) => {
        this.totalOrders = stats?.totalOrders ?? 0;
        this.completedOrders = stats?.completedOrders ?? 0;
        this.pendingOrders = stats?.pendingOrders ?? 0;
        this.inProgressOrders = stats?.inProgressOrders ?? 0;
        this.urgentOrders = stats?.urgentOrders ?? 0;
        this.statsLoaded = true;
      },
      error: () => {
        this.statsLoaded = true; // show zeros rather than mock data
      },
    });
  }

  get today(): string {
    const date = new Date();
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
