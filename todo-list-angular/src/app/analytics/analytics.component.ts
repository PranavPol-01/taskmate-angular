import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { Chart, ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { RouterLink } from '@angular/router';

interface MonthlyCompletion {
  month: string;
  count: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule, RouterLink],
  template: `
    <div class="analytics-container">
      <header class="analytics-header">
        <h1>Task Analytics Dashboard</h1>
        <p class="subtitle">
          Track your productivity and task management metrics
        </p>
      </header>

      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalTasksCompleted }}</h3>
            <p>Tasks Completed</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ averageCompletionTime }}</h3>
            <p>Avg. Completion Time</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-content">
            <h3>{{ statusChartData.datasets[0].data[0] }}</h3>
            <p>Tasks Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-fire"></i>
          </div>
          <div class="stat-content">
            <h3>{{ priorityChartData.datasets[0].data[2] }}</h3>
            <p>High Priority Tasks</p>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-container status-chart">
          <div class="chart-header">
            <h2>Task Status Distribution</h2>
            <div class="chart-actions">
              <button class="btn-refresh" (click)="loadAnalytics()">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <canvas
              baseChart
              [data]="statusChartData"
              [options]="statusChartOptions"
              [type]="'pie'"
            >
            </canvas>
          </div>
        </div>

        <div class="chart-container priority-chart">
          <div class="chart-header">
            <h2>Task Priority Distribution</h2>
            <div class="chart-actions">
              <button class="btn-refresh" (click)="loadAnalytics()">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <canvas
              baseChart
              [data]="priorityChartData"
              [options]="priorityChartOptions"
              [type]="'bar'"
            >
            </canvas>
          </div>
        </div>

        <div class="chart-container completion-chart">
          <div class="chart-header">
            <h2>Task Completion Trend</h2>
            <div class="chart-actions">
              <button class="btn-refresh" (click)="loadAnalytics()">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <canvas
              baseChart
              [data]="completionChartData"
              [options]="completionChartOptions"
              [type]="'line'"
            >
            </canvas>
          </div>
        </div>

        <div class="chart-container metrics-container">
          <div class="chart-header">
            <h2>Performance Details</h2>
            <div class="chart-actions">
              <button class="btn-refresh" (click)="loadAnalytics()">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-label">Average Completion Time:</span>
                <span class="metric-value">{{ averageCompletionTime }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Tasks Completed:</span>
                <span class="metric-value">{{ totalTasksCompleted }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Completion Rate:</span>
                <span class="metric-value"
                  >{{ calculateCompletionRate() }}%</span
                >
              </div>
              <div class="metric-item">
                <span class="metric-label">Tasks In Progress:</span>
                <span class="metric-value">{{
                  statusChartData.datasets[0].data[1]
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="export-section">
        <button class="btn-export">
          <i class="fas fa-download"></i> Export Analytics
        </button>
        <button class="btn-print">
          <i class="fas fa-print"></i> Print Report
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .analytics-container {
        padding: 30px;
        max-width: 1400px;
        margin: 0 auto;
        background-color: #f8f9fa;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }

      .analytics-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 20px;
      }

      .analytics-header h1 {
        color: #2c3e50;
        font-size: 28px;
        margin-bottom: 10px;
        font-weight: 600;
      }

      .subtitle {
        color: #6c757d;
        font-size: 16px;
      }

      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-size: 20px;
      }

      .stat-content h3 {
        font-size: 24px;
        margin: 0;
        color: #2c3e50;
        font-weight: 600;
      }

      .stat-content p {
        margin: 5px 0 0;
        color: #6c757d;
        font-size: 14px;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
        margin-bottom: 30px;
      }

      @media (max-width: 992px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }
      }

      .chart-container {
        background: white;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease;
      }

      .chart-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 15px;
        border-bottom: 1px solid #e9ecef;
      }

      .chart-header h2 {
        margin: 0;
        font-size: 18px;
        color: #2c3e50;
        font-weight: 600;
      }

      .chart-actions {
        display: flex;
        gap: 10px;
      }

      .btn-refresh {
        background: transparent;
        border: none;
        color: #6c757d;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: background-color 0.2s ease;
      }

      .btn-refresh:hover {
        background-color: #f1f3f5;
        color: #2c3e50;
      }

      .chart-body {
        padding: 20px;
        height: 300px;
        position: relative;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .metric-item {
        padding: 15px;
        border-radius: 8px;
        background-color: #f8f9fa;
      }

      .metric-label {
        display: block;
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 5px;
      }

      .metric-value {
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
      }

      .export-section {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
      }

      .btn-export,
      .btn-print {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .btn-export:hover,
      .btn-print:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
      }

      .btn-print {
        background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
      }
    `,
  ],
})
export class AnalyticsComponent implements OnInit {
  statusChartData: any = {
    labels: ['Todo', 'In Progress', 'Done'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  priorityChartData: any = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384'],
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  completionChartData: any = {
    labels: [],
    datasets: [
      {
        label: 'Completed Tasks',
        data: [],
        borderColor: '#4BC0C0',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        pointBackgroundColor: '#4BC0C0',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4BC0C0',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  statusChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        displayColors: true,
        caretSize: 6,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
    },
  };

  priorityChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        caretSize: 6,
      },
    },
    animation: {
      duration: 2000,
    },
  };

  completionChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        caretSize: 6,
      },
    },
    animation: {
      duration: 2000,
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  averageCompletionTime: string = '0 days';
  totalTasksCompleted: number = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.taskService.getTaskAnalytics().subscribe({
      next: (analytics) => {
        // Update status distribution
        this.statusChartData.labels = Object.keys(analytics.status_stats);
        this.statusChartData.datasets[0].data = Object.values(
          analytics.status_stats
        );

        // Update priority distribution
        this.priorityChartData.labels = Object.keys(analytics.priority_stats);
        this.priorityChartData.datasets[0].data = Object.values(
          analytics.priority_stats
        );

        // Update completion trend
        this.completionChartData.labels = analytics.completed_by_month.map(
          (item: MonthlyCompletion) => item.month
        );
        this.completionChartData.datasets[0].data =
          analytics.completed_by_month.map(
            (item: MonthlyCompletion) => item.count
          );

        // Update performance metrics
        this.averageCompletionTime = `${analytics.avg_completion_time} days`;
        this.totalTasksCompleted = analytics.completed_by_month.reduce(
          (sum: number, item: MonthlyCompletion) => sum + item.count,
          0
        );
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      },
    });
  }

  calculateCompletionRate(): number {
    const totalTasks =
      this.statusChartData.datasets[0].data[0] +
      this.statusChartData.datasets[0].data[1] +
      this.statusChartData.datasets[0].data[2];

    if (totalTasks === 0) return 0;

    return Math.round(
      (this.statusChartData.datasets[0].data[2] / totalTasks) * 100
    );
  }
}
