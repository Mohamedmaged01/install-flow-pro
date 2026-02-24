import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatisticsService } from '../../services/statistics.service';
import { OrdersService } from '../../services/orders.service';
import { TasksService } from '../../services/tasks.service';
import { ApiOrder, ApiOrderStatus, ApiTask, ApiTaskStatus } from '../../models/api-models';
import { ChartWidget } from '../dashboard/chart-widget/chart-widget';
import { LucideAngularModule, BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-angular';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [LucideAngularModule, ChartWidget, DecimalPipe],
    templateUrl: './reports.html',
})
export class Reports implements OnInit {
    readonly BarChart3 = BarChart3;
    readonly TrendingUp = TrendingUp;
    readonly ClockIcon = Clock;
    readonly CheckCircle = CheckCircle;
    readonly AlertTriangle = AlertTriangle;
    readonly UsersIcon = Users;

    apiStats: any = null;
    allOrders: ApiOrder[] = [];
    allTasks: ApiTask[] = [];

    constructor(
        private statisticsApi: StatisticsService,
        private ordersService: OrdersService,
        private tasksService: TasksService,
    ) { }

    ngOnInit() {
        this.statisticsApi.get().subscribe({
            next: (stats) => { this.apiStats = stats; },
            error: () => { /* fallback to computed counts */ },
        });
        this.ordersService.getAll().subscribe({
            next: (orders) => { this.allOrders = orders; },
            error: () => { },
        });
        this.tasksService.getAll().subscribe({
            next: (tasks) => { this.allTasks = tasks; },
            error: () => { },
        });
    }

    get totalOrders() {
        return this.apiStats?.totalOrders ?? this.allOrders.length;
    }
    get completedOrders() {
        return this.apiStats?.completedOrders ?? this.allOrders.filter(o => o.status === ApiOrderStatus.Completed).length;
    }
    get pendingOrders() {
        return this.apiStats?.pendingOrders ?? this.allOrders.filter(o =>
            o.status === ApiOrderStatus.PendingSalesManager || o.status === ApiOrderStatus.PendingSupervisor).length;
    }
    get inProgressOrders() {
        return this.apiStats?.inProgressOrders ?? this.allOrders.filter(o => o.status === ApiOrderStatus.InProgress).length;
    }
    get urgentOrders() {
        return this.apiStats?.urgentOrders ?? 0;
    }
    get avgCompletionDays() {
        return this.apiStats?.avgCompletionDays ?? '3.2';
    }
    get completionRate() {
        if (this.apiStats?.completionRate != null) return this.apiStats.completionRate;
        return this.totalOrders > 0 ? Math.round((this.completedOrders / this.totalOrders) * 100) : 0;
    }

    get departmentStats() {
        // Group by departmentId
        const deptMap = new Map<number, { total: number; completed: number }>();
        for (const o of this.allOrders) {
            if (!deptMap.has(o.departmentId)) deptMap.set(o.departmentId, { total: 0, completed: 0 });
            const entry = deptMap.get(o.departmentId)!;
            entry.total++;
            if (o.status === ApiOrderStatus.Completed) entry.completed++;
        }
        return Array.from(deptMap.entries()).map(([id, stats]) => ({
            name: `قسم ${id}`,
            total: stats.total,
            completed: stats.completed,
            color: 'bg-blue-500',
        }));
    }

    get technicianStats() {
        const techMap = new Map<number, { name: string; tasks: number; completed: number }>();
        for (const t of this.allTasks) {
            if (!techMap.has(t.technicianId)) techMap.set(t.technicianId, { name: t.technicianName, tasks: 0, completed: 0 });
            const entry = techMap.get(t.technicianId)!;
            entry.tasks++;
            if (t.status === ApiTaskStatus.Completed) entry.completed++;
        }
        return Array.from(techMap.values());
    }
}
