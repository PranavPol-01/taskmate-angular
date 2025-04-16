import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TaskService } from './services/task.service';
import { AuthService } from './auth/auth.service';
import { first } from 'rxjs';
import { CreateTask, Task } from './models/tasks.model';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    
  ],
  standalone: true,
  imports: [CommonModule, RouterOutlet],
})
export class AppComponent implements OnInit {
  title = 'todo-list-angular';
  receivedChore: any;
  nextId = '';
  tasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.url;

        // Define public routes that don't require authentication
        const publicRoutes = [
          '/login',
          '/register',
          '/admin/login',
          '/complete-registration',
          '/',
          '/landing-page',
        ];

        // Check if the current route is protected and user is not authenticated
        if (
          !publicRoutes.includes(currentRoute) &&
          !this.authService.isAuthenticated()
        ) {
          this.router.navigate(['/login']);
        }
      }
    });

    // Load tasks if authenticated
    if (this.authService.isAuthenticated()) {
      this.loadTasks();
    }
  }

  getUserById(id: string): void {
    this.taskService.getTask(id).subscribe({
      next: (response: CreateTask) => {
        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  addTask(event: any): void {
    this.receivedChore = event;
    this.taskService
      .createTask({
        title: this.receivedChore.value.title,
        category: this.receivedChore.value.category,
        due_date: this.receivedChore.value.due_date,
        description: '',
        status: 'todo',
        priority: 'medium',
      })
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          this.loadTasks();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  editTask(event: any, id: string): void {
    this.receivedChore = event;
    console.log({ event });
    this.taskService
      .updateTask(id, {
        title: this.receivedChore.value.title,
        category: this.receivedChore.value.category,
        due_date: this.receivedChore.value.due_date,
        description: '',
        status: 'todo',
        priority: 'medium',
      })
      .pipe(first())
      .subscribe({
        next: (response: Task) => {
          this.loadTasks();
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          this.receivedChore.reset();
        },
      });
  }

  deleteTask(event: any, id: string): void {
    this.taskService.deleteTask(id).subscribe({
      next: (response) => console.log(response),
      complete: () => {
        this.loadTasks();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  id(id: string): void {
    this.nextId = id;
    console.log(this.nextId);
  }

  loadTasks() {
    this.taskService
      .getTasks()
      .pipe(first())
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          console.log('Tasks loaded successfully:', tasks);
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          if (error.status === 401 || error.status === 422) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        },
      });
  }

  createTask() {
    const newTask: CreateTask = {
      title: this.receivedChore.value.title,
      description: this.receivedChore.value.description,
      category: this.receivedChore.value.category,
      due_date: this.receivedChore.value.due_date,
      status: 'todo',
      priority: 'medium',
    };

    this.taskService.createTask(newTask).subscribe({
      next: (task) => {
        console.log('Task created:', task);
      },
      error: (error) => {
        console.error('Error creating task:', error);
      },
    });
  }
}
