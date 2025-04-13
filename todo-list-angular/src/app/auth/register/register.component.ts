import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center">Register</h2>
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    formControlName="username"
                  />
                  <div
                    *ngIf="
                      username.invalid && (username.dirty || username.touched)
                    "
                    class="text-danger"
                  >
                    <div *ngIf="username.errors?.['required']">
                      Username is required
                    </div>
                    <div *ngIf="username.errors?.['minlength']">
                      Username must be at least 3 characters
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                  />
                  <div
                    *ngIf="email.invalid && (email.dirty || email.touched)"
                    class="text-danger"
                  >
                    <div *ngIf="email.errors?.['required']">
                      Email is required
                    </div>
                    <div *ngIf="email.errors?.['email']">
                      Please enter a valid email
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    formControlName="password"
                  />
                  <div
                    *ngIf="
                      password.invalid && (password.dirty || password.touched)
                    "
                    class="text-danger"
                  >
                    <div *ngIf="password.errors?.['required']">
                      Password is required
                    </div>
                    <div *ngIf="password.errors?.['minlength']">
                      Password must be at least 6 characters
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="role" class="form-label">Role</label>
                  <select class="form-control" id="role" formControlName="role">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="registerForm.invalid"
                  >
                    Register
                  </button>
                </div>
              </form>
              <div class="text-center mt-3">
                <p>Already have an account? <a routerLink="/login">Login</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        margin-top: 2rem;
      }
      .card {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .card-title {
        margin-bottom: 1.5rem;
      }
    `,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  error: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
    });
  }

  ngOnInit(): void {}

  get username() {
    return this.registerForm.get('username')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get role() {
    return this.registerForm.get('role')!;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      const formData = this.registerForm.value;

      this.authService
        .register(
          formData.username,
          formData.email,
          formData.password,
          formData.role
        )
        .subscribe({
          next: (response) => {
            this.loading = false;
            // Store user data temporarily
            localStorage.setItem('temp_user', JSON.stringify(response.user));
            // Navigate to complete registration page
            this.router.navigate(['/complete-registration']);
          },
          error: (err) => {
            this.loading = false;
            this.error =
              err.error?.error || 'Registration failed. Please try again.';
          },
        });
    }
  }
}
