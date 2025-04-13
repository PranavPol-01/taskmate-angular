// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { TaskService, AdminTask } from '../../services/task.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="dashboard-container">
//       <div class="dashboard-header">
//         <h1>Admin Dashboard</h1>
//         <div class="header-actions">
//           <button class="btn btn-primary" (click)="createTask()">
//             <i class="fas fa-plus"></i> Create New Task
//           </button>
//           <button class="btn btn-secondary" (click)="goToAnalytics()">
//             <i class="fas fa-chart-bar"></i> Analytics
//           </button>
//         </div>
//       </div>

//       <div class="task-filters">
//         <div class="filter-group">
//           <label>Filter by Status:</label>
//           <select [(ngModel)]="selectedStatus" (change)="filterTasks()">
//             <option value="all">All Tasks</option>
//             <option value="todo">To Do</option>
//             <option value="in_progress">In Progress</option>
//             <option value="done">Completed</option>
//           </select>
//         </div>
//         <div class="filter-group">
//           <label>Filter by Priority:</label>
//           <select [(ngModel)]="selectedPriority" (change)="filterTasks()">
//             <option value="all">All Priorities</option>
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//           </select>
//         </div>
//       </div>

//       <div class="tasks-grid">
//         <div
//           class="task-column"
//           *ngFor="let status of ['todo', 'in_progress', 'done']"
//         >
//           <h3>{{ getStatusLabel(status) }}</h3>
//           <div class="task-list">
//             <div
//               class="task-card"
//               *ngFor="let task of getFilteredTasksByStatus(status)"
//             >
//               <div class="task-header">
//                 <h4>{{ task.title }}</h4>
//                 <span
//                   class="priority-badge"
//                   [ngClass]="'priority-' + task.priority"
//                 >
//                   {{ task.priority }}
//                 </span>
//               </div>
//               <p class="task-description">{{ task.description }}</p>
//               <div class="task-meta">
//                 <span class="due-date">
//                   <i class="fas fa-calendar"></i>
//                   {{ task.due_date | date }}
//                 </span>
//                 <span class="assigned-to">
//                   <i class="fas fa-user"></i>
//                   {{ task.assigned_to_name }}
//                 </span>
//               </div>
//               <div class="task-actions">
//                 <button class="btn btn-sm btn-primary" (click)="editTask(task)">
//                   <i class="fas fa-edit"></i> Edit
//                 </button>
//                 <button
//                   class="btn btn-sm btn-danger"
//                   (click)="deleteTask(task._id)"
//                 >
//                   <i class="fas fa-trash"></i> Delete
//                 </button>
//               </div>
//             </div>
//             <div
//               class="empty-state"
//               *ngIf="getFilteredTasksByStatus(status).length === 0"
//             >
//               No tasks in this status
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .dashboard-container {
//         padding: 20px;
//         max-width: 1400px;
//         margin: 0 auto;
//       }

//       .dashboard-header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 30px;
//       }

//       .dashboard-header h1 {
//         color: #2c3e50;
//         font-size: 28px;
//         margin: 0;
//       }

//       .header-actions {
//         display: flex;
//         gap: 10px;
//       }

//       .task-filters {
//         display: flex;
//         gap: 20px;
//         margin-bottom: 20px;
//         padding: 15px;
//         background: white;
//         border-radius: 8px;
//         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//       }

//       .filter-group {
//         display: flex;
//         align-items: center;
//         gap: 10px;
//       }

//       .filter-group label {
//         font-weight: 500;
//         color: #4b5563;
//       }

//       .filter-group select {
//         padding: 8px 12px;
//         border: 1px solid #e5e7eb;
//         border-radius: 6px;
//         background-color: white;
//       }

//       .tasks-grid {
//         display: grid;
//         grid-template-columns: repeat(3, 1fr);
//         gap: 20px;
//       }

//       .task-column {
//         background: white;
//         padding: 20px;
//         border-radius: 8px;
//         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//       }

//       .task-column h3 {
//         color: #2c3e50;
//         margin: 0 0 20px 0;
//         font-size: 18px;
//         text-transform: capitalize;
//       }

//       .task-list {
//         display: flex;
//         flex-direction: column;
//         gap: 15px;
//       }

//       .task-card {
//         background: white;
//         border: 1px solid #e5e7eb;
//         border-radius: 8px;
//         padding: 15px;
//         transition: transform 0.2s, box-shadow 0.2s;
//       }

//       .task-card:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//       }

//       .task-header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 10px;
//       }

//       .task-header h4 {
//         margin: 0;
//         color: #2c3e50;
//         font-size: 16px;
//       }

//       .priority-badge {
//         padding: 4px 8px;
//         border-radius: 12px;
//         font-size: 12px;
//         font-weight: 500;
//       }

//       .priority-low {
//         background-color: #d1fae5;
//         color: #065f46;
//       }

//       .priority-medium {
//         background-color: #fef3c7;
//         color: #92400e;
//       }

//       .priority-high {
//         background-color: #fee2e2;
//         color: #991b1b;
//       }

//       .task-description {
//         color: #6b7280;
//         font-size: 14px;
//         margin-bottom: 15px;
//       }

//       .task-meta {
//         display: flex;
//         justify-content: space-between;
//         color: #6b7280;
//         font-size: 12px;
//         margin-bottom: 15px;
//       }

//       .task-actions {
//         display: flex;
//         gap: 10px;
//       }

//       .btn {
//         padding: 8px 16px;
//         border: none;
//         border-radius: 6px;
//         cursor: pointer;
//         font-weight: 500;
//         display: flex;
//         align-items: center;
//         gap: 5px;
//       }

//       .btn-primary {
//         background-color: #3b82f6;
//         color: white;
//       }

//       .btn-secondary {
//         background-color: #6b7280;
//         color: white;
//       }

//       .btn-danger {
//         background-color: #ef4444;
//         color: white;
//       }

//       .btn-sm {
//         padding: 6px 12px;
//         font-size: 12px;
//       }

//       .empty-state {
//         text-align: center;
//         color: #6b7280;
//         padding: 20px;
//         background: #f9fafb;
//         border-radius: 6px;
//       }
//     `,
//   ],
// })
// export class AdminDashboardComponent implements OnInit {
//   tasks: AdminTask[] = [];
//   filteredTasks: AdminTask[] = [];
//   selectedStatus: string = 'all';
//   selectedPriority: string = 'all';
//   errorMessage: string = '';
//   loading: boolean = false;

//   constructor(
//     private router: Router,
//     private taskService: TaskService,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.loadTasks();
//   }

//   loadTasks(): void {
//     this.loading = true;
//     this.errorMessage = '';

//     this.taskService.getAdminTasks().subscribe({
//       next: (tasks) => {
//         this.tasks = tasks;
//         this.filteredTasks = tasks;
//         this.loading = false;
//         this.updateTaskStats();
//       },
//       error: (error) => {
//         this.errorMessage = 'Error loading tasks. Please try again.';
//         this.loading = false;
//         console.error('Error loading tasks:', error);
//       },
//     });
//   }

//   filterTasks() {
//     this.filteredTasks = this.tasks.filter((task) => {
//       const statusMatch =
//         this.selectedStatus === 'all' || task.status === this.selectedStatus;
//       const priorityMatch =
//         this.selectedPriority === 'all' ||
//         task.priority === this.selectedPriority;
//       return statusMatch && priorityMatch;
//     });
//   }

//   getFilteredTasksByStatus(status: string): AdminTask[] {
//     return this.filteredTasks.filter((task) => task.status === status);
//   }

//   getStatusLabel(status: string): string {
//     return status
//       .split('_')
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   }

//   createTask() {
//     this.router.navigate(['/admin/create-task']);
//   }

//   editTask(task: AdminTask) {
//     this.router.navigate(['/admin/tasks', task._id]);
//   }

//   deleteTask(taskId: string) {
//     if (confirm('Are you sure you want to delete this task?')) {
//       this.taskService.deleteTask(taskId).subscribe({
//         next: () => {
//           this.loadTasks();
//         },
//         error: (error) => {
//           console.error('Error deleting task:', error);
//         },
//       });
//     }
//   }

//   goToAnalytics() {
//     this.router.navigate(['/analytics']);
//   }

//   updateTaskStats() {
//     // Implementation of updateTaskStats method
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService, AdminTask } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-dashboard">
      <div class="header">
        <h1>Admin Dashboard</h1>
        <div class="actions">
          <button class="btn btn-primary" (click)="navigateToCreateTask()">
            <i class="fas fa-plus"></i> Create Task
          </button>
          <button class="btn btn-secondary" (click)="navigateToAnalytics()">
            <i class="fas fa-chart-bar"></i> Analytics
          </button>
        </div>
      </div>

      <!-- Toast notifications -->
      <div class="toast-container">
        <div class="toast" *ngFor="let toast of toasts" [ngClass]="toast.type">
          <div class="toast-content">
            <i class="fas" [ngClass]="getToastIcon(toast.type)"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button class="toast-close" (click)="dismissToast(toast.id)">×</button>
        </div>
      </div>

      <!-- Loader overlay -->
      <div class="loader-overlay" *ngIf="loading">
        <div class="loader">
          <div class="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>

      <div class="task-stats" *ngIf="!loading">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-content">
            <h3>Total Tasks</h3>
            <p>{{ taskStats.total }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>Completed Tasks</h3>
            <p>{{ taskStats.completed }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>Pending Tasks</h3>
            <p>{{ taskStats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="filters-container" *ngIf="!loading">
        <h2>Task Filters</h2>
        <div class="filters">
          <div class="filter-group">
            <label for="status-filter">Status:</label>
            <select 
              id="status-filter"
              [(ngModel)]="statusFilter" 
              (change)="applyFilters()"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="priority-filter">Priority:</label>
            <select 
              id="priority-filter"
              [(ngModel)]="priorityFilter" 
              (change)="applyFilters()"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <div class="task-list" *ngIf="!loading">
        <div class="task-card" *ngFor="let task of filteredTasks" [ngClass]="'priority-' + task.priority">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <span class="priority-badge" [ngClass]="task.priority">
              {{ task.priority | titlecase }}
            </span>
          </div>
          
          <p class="task-description">{{ task.description }}</p>

          <div class="task-details">
            <span class="status-badge" [ngClass]="task.status">
              <i class="fas" [ngClass]="getStatusIcon(task.status)"></i>
              {{ formatStatus(task.status) }}
            </span>
            <span class="due-date">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(task.due_date) }}
            </span>
          </div>

          <div class="assigned-to">
            <i class="fas fa-user"></i>
            <span>{{ task.assigned_to_name }}</span>
          </div>

          <div class="task-actions">
            <button class="btn btn-edit" (click)="editTask(task)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-delete" (click)="confirmDeleteTask(task)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredTasks.length === 0">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>No tasks found</h3>
          <p>No tasks match your current filter criteria. Try adjusting your filters or create a new task.</p>
          <button class="btn btn-primary" (click)="clearFilters()">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Confirmation modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="modal-close" (click)="cancelDelete()">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the task "<strong>{{ taskToDelete?.title }}</strong>"?</p>
            <p class="warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
            <button class="btn btn-danger" (click)="deleteTask()">Delete Task</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #333;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h1 {
      margin: 0;
      color: #1565c0;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    /* Toast Notifications */
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 350px;
    }

    .toast {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toast.success {
      background-color: #e8f5e9;
      color: #2e7d32;
      border-left: 4px solid #2e7d32;
    }

    .toast.error {
      background-color: #ffebee;
      color: #c62828;
      border-left: 4px solid #c62828;
    }

    .toast.info {
      background-color: #e3f2fd;
      color: #1565c0;
      border-left: 4px solid #1565c0;
    }

    .toast.warning {
      background-color: #fff3e0;
      color: #e65100;
      border-left: 4px solid #e65100;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: inherit;
    }

    /* Loader */
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #1565c0;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loader p {
      color: #1565c0;
      font-weight: 500;
    }

    /* Task Stats */
    .task-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #e3f2fd;
      color: #1565c0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .completed-icon {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .pending-icon {
      background-color: #fff3e0;
      color: #e65100;
    }

    .stat-content h3 {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .stat-content p {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
    }

    /* Filters */
    .filters-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
    }

    .filters-container h2 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      color: #333;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .filter-group label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
    }

    .filter-group select {
      padding: 0.75rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      color: #333;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .filter-group select:focus {
      outline: none;
      border-color: #1565c0;
      box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.2);
    }

    /* Task List */
    .task-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .task-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      border-top: 4px solid #1565c0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .task-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    .task-card.priority-high {
      border-top-color: #c62828;
    }

    .task-card.priority-medium {
      border-top-color: #e65100;
    }

    .task-card.priority-low {
      border-top-color: #2e7d32;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .task-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .priority-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .priority-badge.high {
      background-color: #ffebee;
      color: #c62828;
    }

    .priority-badge.medium {
      background-color: #fff3e0;
      color: #e65100;
    }

    .priority-badge.low {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .task-description {
      margin: 0 0 1.5rem 0;
      color: #666;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .task-details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-badge.todo {
      background-color: #eceff1;
      color: #546e7a;
    }

    .status-badge.in_progress {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-badge.done {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .due-date {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      background-color: #e3f2fd;
      color: #1565c0;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .assigned-to {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .task-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #f5f5f5;
      color: #9e9e9e;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2rem;
    }

    .empty-state h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .empty-state p {
      margin: 0;
      color: #666;
      max-width: 400px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1010;
    }

    .modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      animation: fadeIn 0.3s ease-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .modal-body .warning {
      color: #c62828;
      font-size: 0.875rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    /* Buttons */
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.3);
    }

    .btn-primary {
      background: #1565c0;
      color: white;
    }

    .btn-primary:hover {
      background: #0d47a1;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #78909c;
      color: white;
    }

    .btn-secondary:hover {
      background: #546e7a;
      transform: translateY(-2px);
    }

    .btn-edit {
      background: #e3f2fd;
      color: #1565c0;
      padding: 0.5rem 1rem;
    }

    .btn-edit:hover {
      background: #bbdefb;
      transform: translateY(-2px);
    }

    .btn-delete {
      background: #ffebee;
      color: #c62828;
      padding: 0.5rem 1rem;
    }

    .btn-delete:hover {
      background: #ffcdd2;
      transform: translateY(-2px);
    }

    .btn-danger {
      background: #c62828;
      color: white;
    }

    .btn-danger:hover {
      background: #b71c1c;
      transform: translateY(-2px);
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Styles */
    @media screen and (max-width: 768px) {
      .task-stats {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .actions {
        width: 100%;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  tasks: AdminTask[] = [];
  filteredTasks: AdminTask[] = [];
  statusFilter: string = 'all';
  priorityFilter: string = 'all';
  errorMessage: string = '';
  loading: boolean = false;
  taskStats: TaskStats = {
    total: 0,
    completed: 0,
    pending: 0
  };
  toasts: any[] = [];
  showDeleteModal: boolean = false;
  taskToDelete: AdminTask | null = null;

  constructor(
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTasks();

    // Subscribe to toast notifications
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getAdminTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.calculateTaskStats();
        this.loading = false;
        this.showToast('success', 'Tasks loaded successfully');
      },
      error: (error) => {
        this.errorMessage = 'Error loading tasks. Please try again.';
        this.loading = false;
        this.showToast('error', 'Failed to load tasks');
        console.error('Error loading tasks:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = this.statusFilter === 'all' || task.status === this.statusFilter;
      const priorityMatch = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      return statusMatch && priorityMatch;
    });
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.applyFilters();
  }

  calculateTaskStats(): void {
    this.taskStats.total = this.tasks.length;
    this.taskStats.completed = this.tasks.filter(task => task.status === 'done').length;
    this.taskStats.pending = this.taskStats.total - this.taskStats.completed;
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/admin/create-task']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  editTask(task: AdminTask): void {
    this.router.navigate(['/admin/tasks', task._id]);
    this.showToast('info', 'Editing task: ' + task.title);
  }

  confirmDeleteTask(task: AdminTask): void {
    this.taskToDelete = task;
    this.showDeleteModal = true;
  }

  deleteTask(): void {
    if (!this.taskToDelete) return;
    
    const taskId = this.taskToDelete._id;
    const taskTitle = this.taskToDelete.title;
    
    this.loading = true;
    this.showDeleteModal = false;
    
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.showToast('success', `Task "${taskTitle}" deleted successfully`);
      },
      error: (error) => {
        this.loading = false;
        this.showToast('error', 'Failed to delete task');
        console.error('Error deleting task:', error);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'No date';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'todo': return 'fa-clipboard-list';
      case 'in_progress': return 'fa-spinner';
      case 'done': return 'fa-check-circle';
      default: return 'fa-question-circle';
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'info': return 'fa-info-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-bell';
    }
  }

  showToast(type: string, message: string): void {
    this.toastService.show(type, message);
  }

  dismissToast(id: number): void {
    this.toastService.dismiss(id);
  }
}