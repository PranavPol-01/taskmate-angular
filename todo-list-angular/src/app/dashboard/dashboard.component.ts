import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TaskService } from '../services/task.service';
import { AuthService } from '../auth/auth.service';
import { Task, CreateTask } from '../models/tasks.model';
import { RouterLink, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
  template: `
    <div class="dashboard-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-area">
            <i class="fas fa-tasks logo-icon"></i>
            <h1>TaskMate</h1>
          </div>
          <div class="nav-links">
            <a routerLink="/analytics" class="nav-link">
              <i class="fas fa-chart-line"></i>
              <span class="link-text">Analytics</span>
            </a>
            <button (click)="logout()" class="logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              <span class="link-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div class="dashboard-layout">
        <aside class="task-form-container">
          <div class="card task-form">
            <div class="card-header">
              <h2>{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h2>
              <div class="form-icon">
                <i
                  [class]="editingTask ? 'fas fa-edit' : 'fas fa-plus-circle'"
                ></i>
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
                    taskForm.get('title')?.invalid &&
                    taskForm.get('title')?.touched
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
              <div class="form-row">
                <div class="form-group half-width">
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
                <div class="form-group half-width">
                  <label for="status">Status</label>
                  <div class="select-wrapper">
                    <select id="status" formControlName="status" required>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <div class="form-actions">
                <button
                  type="submit"
                  [disabled]="!taskForm.valid || isLoading"
                  class="btn-primary"
                >
                  <i [class]="editingTask ? 'fas fa-save' : 'fas fa-plus'"></i>
                  {{ editingTask ? 'Update Task' : 'Create Task' }}
                </button>
                <button
                  type="button"
                  (click)="cancelEdit()"
                  *ngIf="editingTask"
                  class="btn-secondary"
                >
                  <i class="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </aside>

        <main class="task-lists-container">
          <div class="task-status-tabs">
            <button
              [class]="activeTab === 'active' ? 'tab-btn active' : 'tab-btn'"
              (click)="setActiveTab('active')"
            >
              <i class="fas fa-clipboard-list"></i> Active Tasks
            </button>
            <button
              [class]="activeTab === 'completed' ? 'tab-btn active' : 'tab-btn'"
              (click)="setActiveTab('completed')"
            >
              <i class="fas fa-clipboard-check"></i> Completed Tasks
            </button>
          </div>

          <div class="loading-state" *ngIf="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading tasks...</span>
          </div>

          <div class="error-state" *ngIf="errorMessage">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ errorMessage }}</span>
            <button (click)="retryLoading()" class="btn-secondary">
              <i class="fas fa-redo"></i> Retry
            </button>
          </div>

          <div
            class="task-list"
            *ngIf="!isLoading && !errorMessage && activeTab === 'active'"
          >
            <div class="empty-state" *ngIf="activeTasks.length === 0">
              <div class="empty-icon">
                <i class="fas fa-clipboard"></i>
              </div>
              <h3>No active tasks</h3>
              <p>Create a new task to get started</p>
            </div>

            <div class="card task-card" *ngFor="let task of activeTasks">
              <div class="task-header">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-badges">
                  <span class="priority-badge" [ngClass]="task.priority">
                    {{ task.priority }}
                  </span>
                  <span class="status-badge" [ngClass]="task.status">
                    {{
                      task.status === 'todo'
                        ? 'To Do'
                        : task.status === 'in_progress'
                        ? 'In Progress'
                        : 'Done'
                    }}
                  </span>
                </div>
              </div>
              <div class="task-body">
                <p class="task-description">{{ task.description }}</p>
                <div class="task-metadata">
                  <div class="task-due-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ task.due_date | date : 'MMM d, y, h:mm a' }}</span>
                  </div>
                </div>
              </div>
              <div class="task-actions">
                <button (click)="editTask(task)" class="action-btn edit">
                  <i class="fas fa-edit"></i>
                  <span>Edit</span>
                </button>
                <button
                  (click)="completeTask(task._id)"
                  class="action-btn complete"
                >
                  <i class="fas fa-check"></i>
                  <span>Complete</span>
                </button>
                <button
                  (click)="confirmDelete(task._id)"
                  class="action-btn delete"
                >
                  <i class="fas fa-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div
            class="task-list"
            *ngIf="!isLoading && !errorMessage && activeTab === 'completed'"
          >
            <div class="empty-state" *ngIf="completedTasks.length === 0">
              <div class="empty-icon">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <h3>No completed tasks</h3>
              <p>Complete tasks to see them here</p>
            </div>

            <div
              class="card task-card completed"
              *ngFor="let task of completedTasks"
            >
              <div class="task-header">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-badges">
                  <span class="completed-badge">
                    <i class="fas fa-check-circle"></i> Completed
                  </span>
                </div>
              </div>
              <div class="task-body">
                <p class="task-description">{{ task.description }}</p>
                <div class="task-metadata">
                  <div class="task-completed-date">
                    <i class="fas fa-calendar-check"></i>
                    <span
                      >Completed on
                      {{ task.completed_at | date : 'MMM d, y, h:mm a' }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="task-actions">
                <button
                  (click)="confirmDelete(task._id)"
                  class="action-btn delete"
                >
                  <i class="fas fa-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div class="delete-modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirm Deletion</h3>
            <button (click)="showDeleteModal = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this task?</p>
            <p class="delete-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button (click)="showDeleteModal = false" class="btn-secondary">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button (click)="deleteTask()" class="btn-danger">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <div class="toast" *ngIf="toastMessage" [@fadeInOut]>
        <i [class]="toastIcon"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        --primary-color: #4f46e5;
        --primary-hover: #4338ca;
        --secondary-color: #6b7280;
        --danger-color: #ef4444;
        --success-color: #10b981;
        --warning-color: #f59e0b;
        --info-color: #3b82f6;
        --light-gray: #f3f4f6;
        --medium-gray: #e5e7eb;
        --dark-gray: #6b7280;
        --text-color: #111827;
        --text-light: #4b5563;
        --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
          0 1px 2px 0 rgba(0, 0, 0, 0.06);
        --card-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }

      .dashboard-container {
        min-height: 100vh;
        background-color: #f9fafb;
        color: var(--text-color);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* Header Styles */
      .app-header {
        background-color: white;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        max-width: 1400px;
        margin: 0 auto;
        height: 70px;
      }

      .logo-area {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .logo-icon {
        color: var(--primary-color);
        font-size: 1.75rem;
      }

      .logo-area h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .nav-links {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .nav-link,
      .logout-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .nav-link {
        color: var(--text-light);
        background-color: transparent;
        border: 1px solid transparent;
      }

      .nav-link:hover {
        color: var(--primary-color);
        background-color: var(--light-gray);
      }

      .logout-btn {
        color: white;
        background-color: var(--danger-color);
        border: none;
        cursor: pointer;
      }

      .logout-btn:hover {
        background-color: #dc2626;
      }

      /* Layout Styles */
      .dashboard-layout {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      /* Card Styles */
      .card {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: var(--card-shadow);
        overflow: hidden;
        transition: box-shadow 0.3s ease;
      }

      .card:hover {
        box-shadow: var(--card-shadow-hover);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem;
        border-bottom: 1px solid var(--medium-gray);
      }

      .card-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .form-icon {
        font-size: 1.25rem;
        color: var(--primary-color);
      }

      /* Form Styles */
      .task-form {
        position: sticky;
        top: 90px;
      }

      .task-form form {
        padding: 1.25rem;
      }

      .form-group {
        margin-bottom: 1.25rem;
      }

      .form-row {
        display: flex;
        gap: 1rem;
      }

      .half-width {
        flex: 1;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-light);
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 0.625rem 0.75rem;
        border: 1px solid var(--medium-gray);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: var(--text-color);
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
        color: var(--dark-gray);
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
        color: var(--dark-gray);
        pointer-events: none;
      }

      input:focus,
      textarea:focus,
      select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .error-message {
        color: var(--danger-color);
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 0.75rem;
      }

      .btn-primary,
      .btn-secondary,
      .btn-danger {
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
        background-color: var(--primary-color);
        color: white;
      }

      .btn-primary:hover {
        background-color: var(--primary-hover);
      }

      .btn-primary:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: var(--secondary-color);
        color: white;
      }

      .btn-secondary:hover {
        background-color: #4b5563;
      }

      .btn-danger {
        background-color: var(--danger-color);
        color: white;
      }

      .btn-danger:hover {
        background-color: #dc2626;
      }

      /* Task List Styles */
      .task-status-tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .tab-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        background-color: white;
        border: 1px solid var(--medium-gray);
        border-radius: 0.375rem;
        font-weight: 500;
        color: var(--text-light);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .tab-btn.active {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }

      .task-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .task-card {
        display: flex;
        flex-direction: column;
      }

      .task-card.completed {
        opacity: 0.8;
      }

      .task-header {
        padding: 1.25rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        border-bottom: 1px solid var(--medium-gray);
      }

      .task-title {
        font-weight: 600;
        font-size: 1.125rem;
        color: var(--text-color);
      }

      .task-badges {
        display: flex;
        gap: 0.5rem;
      }

      .priority-badge,
      .status-badge,
      .completed-badge {
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
      }

      .priority-badge.low {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success-color);
      }

      .priority-badge.medium {
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--warning-color);
      }

      .priority-badge.high {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--danger-color);
      }

      .status-badge.todo {
        background-color: rgba(107, 114, 128, 0.1);
        color: var(--secondary-color);
      }

      .status-badge.in_progress {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--info-color);
      }

      .status-badge.done {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success-color);
      }

      .completed-badge {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success-color);
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .task-body {
        padding: 1.25rem;
        flex-grow: 1;
      }

      .task-description {
        margin: 0 0 1rem;
        color: var(--text-light);
        line-height: 1.5;
      }

      .task-metadata {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        color: var(--dark-gray);
        font-size: 0.875rem;
      }

      .task-due-date,
      .task-completed-date {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .task-actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-top: 1px solid var(--medium-gray);
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .action-btn.edit {
        color: var(--warning-color);
        background-color: rgba(245, 158, 11, 0.1);
      }

      .action-btn.edit:hover {
        background-color: rgba(245, 158, 11, 0.2);
      }

      .action-btn.complete {
        color: var(--success-color);
        background-color: rgba(16, 185, 129, 0.1);
      }

      .action-btn.complete:hover {
        background-color: rgba(16, 185, 129, 0.2);
      }

      .action-btn.delete {
        color: var(--danger-color);
        background-color: rgba(239, 68, 68, 0.1);
      }

      .action-btn.delete:hover {
        background-color: rgba(239, 68, 68, 0.2);
      }

      /* Empty State */
      .empty-state {
        padding: 3rem 2rem;
        text-align: center;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: var(--card-shadow);
      }

      .empty-icon {
        font-size: 3rem;
        color: var(--medium-gray);
        margin-bottom: 1.5rem;
      }

      .empty-state h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        color: var(--text-color);
      }

      .empty-state p {
        margin: 0;
        color: var(--text-light);
      }

      /* Delete Modal */
      .delete-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background-color: white;
        border-radius: 0.5rem;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem;
        border-bottom: 1px solid var(--medium-gray);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .close-btn {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        color: var(--dark-gray);
        cursor: pointer;
      }

      .modal-body {
        padding: 1.5rem 1.25rem;
      }

      .delete-warning {
        color: var(--danger-color);
        font-weight: 500;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.25rem;
        border-top: 1px solid var(--medium-gray);
      }

      /* Responsive Styles */
      @media (max-width: 992px) {
        .dashboard-layout {
          grid-template-columns: 1fr;
        }

        .task-form {
          position: static;
          margin-bottom: 2rem;
        }
      }

      @media (max-width: 768px) {
        .header-content {
          padding: 1rem;
        }

        .dashboard-layout {
          padding: 1rem;
          gap: 1rem;
        }

        .form-row {
          flex-direction: column;
          gap: 1.25rem;
        }

        .task-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      @media (max-width: 576px) {
        .link-text {
          display: none;
        }

        .nav-link,
        .logout-btn {
          padding: 0.5rem;
          font-size: 1.125rem;
        }

        .logo-area h1 {
          font-size: 1.25rem;
        }

        .task-actions {
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          justify-content: center;
        }
      }

      .loading-state,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: var(--card-shadow);
        margin-bottom: 1rem;
      }

      .loading-state i,
      .error-state i {
        font-size: 2rem;
        margin-bottom: 1rem;
      }

      .loading-state i {
        color: var(--primary-color);
      }

      .error-state i {
        color: var(--danger-color);
      }

      .toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      }

      .toast i {
        font-size: 1.25rem;
      }

      .toast.success i {
        color: var(--success-color);
      }

      .toast.error i {
        color: var(--danger-color);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeInOut {
        0% {
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  taskForm: FormGroup;
  activeTasks: Task[] = [];
  completedTasks: Task[] = [];
  editingTask: Task | null = null;
  activeTab: string = 'active';
  showDeleteModal: boolean = false;
  taskToDeleteId: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  toastMessage: string = '';
  toastIcon: string = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      due_date: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['todo', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.activeTasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.isLoading = false;
      },
    });

    this.taskService.getCompletedTasks().subscribe({
      next: (tasks) => {
        this.completedTasks = tasks;
      },
      error: (error) => {
        console.error('Error loading completed tasks:', error);
        if (!this.errorMessage) {
          this.errorMessage =
            'Failed to load completed tasks. Please try again.';
        }
      },
    });
  }

  retryLoading(): void {
    this.loadTasks();
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const formValue = this.taskForm.value;
      const taskData = {
        ...formValue,
        due_date: new Date(formValue.due_date).toISOString(),
      };

      if (this.editingTask) {
        this.taskService.updateTask(this.editingTask._id, taskData).subscribe({
          next: () => {
            this.showToast('Task updated successfully', 'success');
            this.taskForm.reset({
              priority: 'medium',
              status: 'todo',
            });
            this.editingTask = null;
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.showToast('Failed to update task', 'error');
            this.isLoading = false;
          },
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.showToast('Task created successfully', 'success');
            this.taskForm.reset({
              priority: 'medium',
              status: 'todo',
            });
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.showToast('Failed to create task', 'error');
            this.isLoading = false;
          },
        });
      }
    }
  }

  editTask(task: Task): void {
    this.editingTask = task;
    const dueDate = task.due_date
      ? new Date(task.due_date).toISOString().slice(0, 16)
      : '';
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      due_date: dueDate,
      priority: task.priority,
      status: task.status,
    });
  }

  cancelEdit(): void {
    this.editingTask = null;
    this.taskForm.reset({
      priority: 'medium',
      status: 'todo',
    });
  }

  completeTask(taskId: string): void {
    this.isLoading = true;
    this.taskService.updateTask(taskId, { status: 'done' }).subscribe({
      next: () => {
        this.showToast('Task completed successfully', 'success');
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error completing task:', error);
        this.showToast('Failed to complete task', 'error');
        this.isLoading = false;
      },
    });
  }

  confirmDelete(taskId: string): void {
    this.taskToDeleteId = taskId;
    this.showDeleteModal = true;
  }

  deleteTask(): void {
    if (this.taskToDeleteId) {
      this.isLoading = true;
      this.taskService.deleteTask(this.taskToDeleteId).subscribe({
        next: () => {
          this.showToast('Task deleted successfully', 'success');
          this.showDeleteModal = false;
          this.taskToDeleteId = null;
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.showToast('Failed to delete task', 'error');
          this.isLoading = false;
          this.showDeleteModal = false;
          this.taskToDeleteId = null;
        },
      });
    }
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastIcon =
      type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  logout(): void {
    this.authService.logout();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
