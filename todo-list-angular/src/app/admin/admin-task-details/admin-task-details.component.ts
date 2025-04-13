// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { TaskService } from '../../services/task.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-admin-task-details',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="admin-task-details">
//       <h2>Task Management</h2>
//       <div *ngIf="task">
//         <div class="task-info">
//           <h3>{{ task.title }}</h3>
//           <p>{{ task.description }}</p>
//           <p>Status: {{ task.status }}</p>
//           <p>Priority: {{ task.priority }}</p>
//           <p>Due Date: {{ task.due_date | date }}</p>
//           <p>Assigned To: {{ task.assigned_to }}</p>
//         </div>
//         <div class="task-actions">
//           <button
//             (click)="updateTaskStatus('in_progress')"
//             *ngIf="task.status === 'todo'"
//           >
//             Start Task
//           </button>
//           <button
//             (click)="updateTaskStatus('done')"
//             *ngIf="task.status === 'in_progress'"
//           >
//             Complete Task
//           </button>
//           <button (click)="deleteTask()" class="delete">Delete Task</button>
//           <button (click)="goBack()">Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .admin-task-details {
//         padding: 20px;
//         max-width: 800px;
//         margin: 0 auto;
//       }
//       .task-info {
//         background: #f5f5f5;
//         padding: 20px;
//         border-radius: 8px;
//         margin-bottom: 20px;
//       }
//       .task-actions {
//         display: flex;
//         gap: 10px;
//       }
//       button {
//         padding: 10px 20px;
//         border: none;
//         border-radius: 4px;
//         cursor: pointer;
//         background: #007bff;
//         color: white;
//       }
//       button:hover {
//         background: #0056b3;
//       }
//       .delete {
//         background: #dc3545;
//       }
//       .delete:hover {
//         background: #c82333;
//       }
//     `,
//   ],
// })
// export class AdminTaskDetailsComponent implements OnInit {
//   task: any;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private taskService: TaskService
//   ) {}

//   ngOnInit() {
//     const taskId = this.route.snapshot.paramMap.get('id');
//     if (taskId) {
//       this.taskService.getTask(taskId).subscribe({
//         next: (task) => {
//           this.task = task;
//         },
//         error: (error) => {
//           console.error('Error fetching task:', error);
//         },
//       });
//     }
//   }

//   updateTaskStatus(newStatus: string) {
//     if (this.task) {
//       this.taskService
//         .updateTask(this.task._id, { status: newStatus })
//         .subscribe({
//           next: () => {
//             this.task.status = newStatus;
//           },
//           error: (error) => {
//             console.error('Error updating task:', error);
//           },
//         });
//     }
//   }

//   deleteTask() {
//     if (this.task) {
//       this.taskService.deleteTask(this.task._id).subscribe({
//         next: () => {
//           this.router.navigate(['/admin/dashboard']);
//         },
//         error: (error) => {
//           console.error('Error deleting task:', error);
//         },
//       });
//     }
//   }

//   goBack() {
//     this.router.navigate(['/admin/dashboard']);
//   }
// }
// src/app/admin/admin-task-details/admin-task-details.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from '../../models/tasks.model'; // ✅ Import type

@Component({
  selector: 'app-admin-task-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-task-details">
      <h2>Task Management</h2>
      <div *ngIf="task">
        <div class="task-info">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <p>Status: {{ task.status }}</p>
          <p>Priority: {{ task.priority }}</p>
          <p>Due Date: {{ task.due_date | date }}</p>
          <p>Assigned To: {{ task.assigned_to }}</p>
        </div>
        <div class="task-actions">
          <button
            (click)="updateTaskStatus('in_progress')"
            *ngIf="task.status === 'todo'"
          >
            Start Task
          </button>
          <button
            (click)="updateTaskStatus('done')"
            *ngIf="task.status === 'in_progress'"
          >
            Complete Task
          </button>
          <button (click)="deleteTask()" class="delete">Delete Task</button>
          <button (click)="goBack()">Back to Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-task-details {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .task-info {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .task-actions {
        display: flex;
        gap: 10px;
      }
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: #007bff;
        color: white;
      }
      button:hover {
        background: #0056b3;
      }
      .delete {
        background: #dc3545;
      }
      .delete:hover {
        background: #c82333;
      }
    `,
  ],
})
export class AdminTaskDetailsComponent implements OnInit {
  task: Task | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.taskService.getTask(taskId).subscribe({
        next: (task) => {
          this.task = task;
        },
        error: (error) => {
          console.error('Error fetching task:', error);
        },
      });
    }
  }

  updateTaskStatus(newStatus: TaskStatus) {
    if (this.task) {
      this.taskService
        .updateTask(this.task._id, { status: newStatus })
        .subscribe({
          next: () => {
            this.task!.status = newStatus;
          },
          error: (error) => {
            console.error('Error updating task:', error);
          },
        });
    }
  }

  deleteTask() {
    if (this.task) {
      this.taskService.deleteTask(this.task._id).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
