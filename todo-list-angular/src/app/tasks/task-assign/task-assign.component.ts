import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CompanyService } from '../../services/company.service';
import { Task } from '../../services/task.service';
import { Employee } from '../../services/company.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-assign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task-assign-container">
      <h2>Assign Task</h2>
      <form [formGroup]="assignForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="assigned_to">Assign to:</label>
          <select
            id="assigned_to"
            formControlName="assigned_to"
            class="form-control"
          >
            <option value="">Select employee</option>
            <option *ngFor="let employee of employees" [value]="employee.id">
              {{ employee.username }} ({{ employee.role }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="due_date">Due Date:</label>
          <input
            type="date"
            id="due_date"
            formControlName="due_date"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="priority">Priority:</label>
          <select id="priority" formControlName="priority" class="form-control">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="submit"
          [disabled]="!assignForm.valid"
          class="btn btn-primary"
        >
          Assign Task
        </button>
        <button type="button" (click)="onCancel()" class="btn btn-secondary">
          Cancel
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .task-assign-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .btn {
        padding: 0.5rem 1rem;
        margin-right: 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-primary {
        background: #007bff;
        color: white;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class TaskAssignComponent implements OnInit {
  assignForm: FormGroup;
  task: Task;
  employees: Employee[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private companyService: CompanyService
  ) {
    this.assignForm = this.fb.group({
      assigned_to: ['', Validators.required],
      due_date: ['', Validators.required],
      priority: ['medium', Validators.required],
    });
  }

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.taskService.getTask(taskId).subscribe((task) => {
        this.task = task;
        this.assignForm.patchValue({
          due_date: task.due_date,
          priority: task.priority,
        });
      });
    }

    this.companyService.getEmployees().subscribe((employees) => {
      this.employees = employees;
    });
  }

  onSubmit() {
    if (this.assignForm.valid && this.task) {
      const updatedTask = {
        ...this.task,
        ...this.assignForm.value,
      };

      this.taskService.updateTask(this.task.id, updatedTask).subscribe({
        next: () => {
          this.router.navigate(['/tasks', this.task.id]);
        },
        error: (error) => {
          console.error('Error assigning task:', error);
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/tasks']);
  }
}
