import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';

interface Employee {
  _id: string;
  username: string;
}

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="create-task-container">
      <div class="card task-form">
        <div class="card-header">
          <h2>Create New Task</h2>
          <div class="form-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
        </div>
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Title</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              required
              placeholder="Enter task title"
            />
            <div
              *ngIf="
                taskForm.get('title')?.invalid && taskForm.get('title')?.touched
              "
              class="error-message"
            >
              Title is required
            </div>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              required
              placeholder="Enter task description"
              rows="4"
            ></textarea>
            <div
              *ngIf="
                taskForm.get('description')?.invalid &&
                taskForm.get('description')?.touched
              "
              class="error-message"
            >
              Description is required
            </div>
          </div>
          <div class="form-group">
            <label for="assigned_to">Assign To</label>
            <div class="select-wrapper">
              <select id="assigned_to" formControlName="assigned_to" required>
                <option value="">Select an employee</option>
                <option
                  *ngFor="let employee of employees"
                  [value]="employee._id"
                >
                  {{ employee.username }}
                </option>
              </select>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div
              *ngIf="
                taskForm.get('assigned_to')?.invalid &&
                taskForm.get('assigned_to')?.touched
              "
              class="error-message"
            >
              Please select an employee
            </div>
          </div>
          <div class="form-group">
            <label for="due_date">Due Date</label>
            <div class="input-with-icon">
              <i class="fas fa-calendar-alt icon-left"></i>
              <input
                type="datetime-local"
                id="due_date"
                formControlName="due_date"
                required
              />
            </div>
            <div
              *ngIf="
                taskForm.get('due_date')?.invalid &&
                taskForm.get('due_date')?.touched
              "
              class="error-message"
            >
              Due date is required
            </div>
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <div class="select-wrapper">
              <select id="priority" formControlName="priority" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>
          <div class="form-actions">
            <button
              type="submit"
              [disabled]="!taskForm.valid || isLoading"
              class="btn-primary"
            >
              <i class="fas fa-plus"></i>
              Create Task
            </button>
            <button type="button" (click)="cancel()" class="btn-secondary">
              <i class="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .create-task-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      .card {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
          0 1px 2px 0 rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .card-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .form-icon {
        font-size: 1.25rem;
        color: #4f46e5;
      }

      form {
        padding: 1.25rem;
      }

      .form-group {
        margin-bottom: 1.25rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #4b5563;
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 0.625rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: #111827;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .input-with-icon {
        position: relative;
      }

      .icon-left {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #6b7280;
      }

      .input-with-icon input {
        padding-left: 2.5rem;
      }

      .select-wrapper {
        position: relative;
      }

      .select-wrapper select {
        appearance: none;
      }

      .select-wrapper i {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #6b7280;
        pointer-events: none;
      }

      input:focus,
      textarea:focus,
      select:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .error-message {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 0.75rem;
      }

      .btn-primary,
      .btn-secondary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        border: none;
        border-radius: 0.375rem;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-primary {
        background-color: #4f46e5;
        color: white;
      }

      .btn-primary:hover {
        background-color: #4338ca;
      }

      .btn-primary:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: #6b7280;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #4b5563;
      }
    `,
  ],
})
export class CreateTaskComponent implements OnInit {
  taskForm: FormGroup;
  employees: Employee[] = [];
  isLoading: boolean = false;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      assigned_to: ['', Validators.required],
      due_date: ['', Validators.required],
      priority: ['medium', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.taskService.getCompanyEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const formValue = this.taskForm.value;
      const taskData = {
        ...formValue,
        due_date: new Date(formValue.due_date).toISOString(),
      };

      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.isLoading = false;
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
