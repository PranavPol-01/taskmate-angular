import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, retry, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateTask, Task, TaskStats } from '../models/tasks.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface TaskAnalytics {
  status_stats: {
    todo: number;
    in_progress: number;
    done: number;
  };
  priority_stats: {
    low: number;
    medium: number;
    high: number;
  };
  completed_by_month: Array<{
    month: string;
    count: number;
  }>;
  avg_completion_time: number;
}

export interface AdminTask extends Task {
  assigned_to_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = environment.apiUrl;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getRequestOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      withCredentials: true,
    };
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/tasks`,
      this.getRequestOptions()
    );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(
      `${this.apiUrl}/tasks/${id}`,
      this.getRequestOptions()
    );
  }

  createTask(task: CreateTask): Observable<Task> {
    return this.http.post<Task>(
      `${this.apiUrl}/tasks`,
      task,
      this.getRequestOptions()
    );
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/tasks/${id}`,
      task,
      this.getRequestOptions()
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/tasks/${id}`,
      this.getRequestOptions()
    );
  }

  getCompletedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/tasks/completed`,
      this.getRequestOptions()
    );
  }

  completeTask(id: string): Observable<Task> {
    return this.http.post<Task>(
      `${this.apiUrl}/tasks/${id}/complete`,
      {},
      this.getRequestOptions()
    );
  }

  getTaskAnalytics(): Observable<TaskAnalytics> {
    return this.http.get<TaskAnalytics>(
      `${this.apiUrl}/analytics/tasks`,
      this.getRequestOptions()
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Token might be expired, try to refresh
      const token = localStorage.getItem('token');
      if (token) {
        // You might want to implement token refresh logic here
        console.error('Token expired or invalid');
      }
    }
    return throwError(() => error);
  }

  searchTasks(query: string): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}`,
      this.getRequestOptions()
    );
  }

  getTaskStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(
      `${this.apiUrl}/stats`,
      this.getRequestOptions()
    );
  }

  listTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}`, this.getRequestOptions());
  }

  addTask(task: CreateTask): Observable<Task> {
    return this.http.post<Task>(
      `${this.apiUrl}`,
      task,
      this.getRequestOptions()
    );
  }

  getAdminTasks(): Observable<AdminTask[]> {
    return this.http
      .get<AdminTask[]>(`${this.apiUrl}/admin/tasks`, this.getRequestOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
  }

  createAdminTask(taskData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/admin/tasks`,
      taskData,
      this.getRequestOptions()
    );
  }

  addComment(taskId: string, comment: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/tasks/${taskId}/comments`,
      { text: comment },
      this.getRequestOptions()
    );
  }

  getCompanyEmployees(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/admin/employees`,
      this.getRequestOptions()
    );
  }
}
