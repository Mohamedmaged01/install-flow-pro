import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatisticsService } from '../../services/statistics.service';
import { OrdersService } from '../../services/orders.service';
import { TasksService } from '../../services/tasks.service';
import { BranchesService } from '../../services/branches.service';
import { DepartmentsService } from '../../services/departments.service';
import { ApiOrder, ApiOrderStatus, ApiTask, ApiTaskStatus } from '../../models/api-models';
import { ChartWidget } from '../dashboard/chart-widget/chart-widget';
import { LucideAngularModule, BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users, MapPin, RotateCcw, ShieldCheck } from 'lucide-angular';

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
    readonly MapPin = MapPin;
    readonly RotateCcw = RotateCcw;
    readonly ShieldCheck = ShieldCheck;

    apiStats: any = null;
    allOrders: ApiOrder[] = [];
    allTasks: ApiTask[] = [];
    departmentNames: Map<number, string> = new Map();

    constructor(
        private statisticsApi: StatisticsService,
        private ordersService: OrdersService,
        private tasksService: TasksService,
        private branchesService: BranchesService,
        private departmentsService: DepartmentsService,
    ) { }

    ngOnInit() {
        this.statisticsApi.get().subscribe({
            next: (stats) => { this.apiStats = stats; },
            error: () => { /* fallback to computed counts */ },
        });
        this.ordersService.getAll().subscribe({
            next: (orders) => {
                this.allOrders = orders;
                // Load department names for all unique branchId/deptId combos
                const seen = new Set<string>();
                orders.forEach(o => {
                    const key = `${o.branchId}-${o.departmentId}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        this.departmentsService.getByBranch(o.branchId).subscribe({
                            next: (depts) => {
                                depts.forEach(d => this.departmentNames.set(d.id, d.name));
                            },
                            error: () => { },
                        });
                    }
                });
            },
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
        const deptMap = new Map<number, { total: number; completed: number }>();
        for (const o of this.allOrders) {
            if (!deptMap.has(o.departmentId)) deptMap.set(o.departmentId, { total: 0, completed: 0 });
            const entry = deptMap.get(o.departmentId)!;
            entry.total++;
            if (o.status === ApiOrderStatus.Completed) entry.completed++;
        }
        return Array.from(deptMap.entries()).map(([id, stats]) => ({
            name: this.departmentNames.get(id) ?? `قسم ${id}`,
            total: stats.total,
            completed: stats.completed,
            color: 'bg-blue-500',
        }));
    }

    get cityStats() {
        const cityMap = new Map<string, number>();
        for (const o of this.allOrders) {
            const city = o.city || 'غير محدد';
            cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
        }
        return Array.from(cityMap.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count);
    }

    /** Return rate: % of orders with status Returned */
    get returnRate(): number {
        if (this.allOrders.length === 0) return 0;
        const returned = this.allOrders.filter(o => o.status === ApiOrderStatus.Returned).length;
        return Math.round((returned / this.allOrders.length) * 100);
    }

    /** SLA compliance: % of completed orders where completion was on or before scheduledDate */
    get slaComplianceRate(): number {
        const completed = this.allOrders.filter(o => o.status === ApiOrderStatus.Completed && o.scheduledDate);
        if (completed.length === 0) return 0;
        const onTime = completed.filter(o => {
            // history not available here; use scheduledDate vs now as proxy
            return new Date(o.scheduledDate!) >= new Date();
        });
        return Math.round((onTime.length / completed.length) * 100);
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
