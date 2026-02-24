import { Component, Input, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './chart-widget.html',
  styles: ``,
})
export class ChartWidget implements OnInit {
  @Input() type: 'doughnut' | 'bar' | 'line' = 'bar';
  @Input() title: string = '';

  public chartData: ChartConfiguration<'doughnut' | 'bar' | 'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartOptions<'doughnut' | 'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  ngOnInit() {
    this.setupChartData();
  }

  setupChartData() {
    if (this.type === 'doughnut') {
      this.chartData = {
        labels: ['برامج', 'بوابات', 'أنظمة أمنية'],
        datasets: [
          {
            data: [350, 450, 100],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 8,
          }
        ]
      };
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            rtl: true,
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                family: 'Cairo',
                size: 12,
              },
            },
          },
        },
      } as any;
    } else if (this.type === 'bar') {
      this.chartData = {
        labels: ['جديدة', 'قيد العمل', 'معلقة', 'مكتملة'],
        datasets: [
          {
            data: [65, 59, 80, 81],
            label: 'توزيع حسب الحالة',
            backgroundColor: ['#3b82f6', '#6366f1', '#f59e0b', '#10b981'],
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 32,
          }
        ]
      };
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Cairo', size: 11 },
              color: '#94a3b8',
            },
            border: { display: false },
          },
          y: {
            grid: {
              color: 'rgba(0,0,0,0.04)',
            },
            ticks: {
              font: { family: 'Cairo', size: 11 },
              color: '#94a3b8',
            },
            border: { display: false },
          },
        },
      } as any;
    } else if (this.type === 'line') {
      this.chartData = {
        labels: ['الجمعة', 'السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        datasets: [
          {
            data: [0, 0, 5, 0, 0, 0, 0],
            label: 'الأوامر',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: '#3b82f6',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#3b82f6',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
          }
        ]
      };
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Cairo', size: 11 },
              color: '#94a3b8',
            },
            border: { display: false },
          },
          y: {
            grid: {
              color: 'rgba(0,0,0,0.04)',
            },
            ticks: {
              font: { family: 'Cairo', size: 11 },
              color: '#94a3b8',
            },
            border: { display: false },
          },
        },
      } as any;
    }
  }
}
