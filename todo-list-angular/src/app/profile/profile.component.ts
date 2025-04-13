import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TaskService } from '../services/task.service';
import { Task } from '../models/tasks.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h2>User Profile</h2>
      <div class="profile-info" *ngIf="user">
        <div class="info-card">
          <h3>Personal Information</h3>
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>Company Code:</strong> {{ user.company_code }}</p>
        </div>
      </div>

      <div class="task-stats" *ngIf="user">
        <div class="stats-card">
          <h3>Task Statistics</h3>
          <p><strong>Total Tasks:</strong> {{ taskStats.total }}</p>
          <p><strong>Completed Tasks:</strong> {{ taskStats.completed }}</p>
          <p><strong>In Progress:</strong> {{ taskStats.inProgress }}</p>
          <p><strong>To Do:</strong> {{ taskStats.todo }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .profile-info,
      .task-stats {
        margin-bottom: 30px;
      }
      .info-card,
      .stats-card {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      p {
        margin: 10px 0;
      }
      strong {
        color: #666;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  taskStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadTaskStats();
  }

  loadUserProfile() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.user = userData;
    }
  }

  loadTaskStats() {
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        this.taskStats.total = tasks.length;
        this.taskStats.completed = tasks.filter(
          (t) => t.status === 'done'
        ).length;
        this.taskStats.inProgress = tasks.filter(
          (t) => t.status === 'in_progress'
        ).length;
        this.taskStats.todo = tasks.filter((t) => t.status === 'todo').length;
      },
      error: (error) => {
        console.error('Error loading task stats:', error);
      },
    });
  }
}
