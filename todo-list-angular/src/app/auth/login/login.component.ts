import { Component } from '@angular/core';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="login-card">
              <div class="login-header">
                <h2>Welcome Back</h2>
                <p>Enter your credentials to access your account</p>
              </div>

              <div class="login-body">
                <div *ngIf="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="form-group mb-3">
                    <label for="username" class="form-label">Username</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-person input-icon"></i>
                      <input
                        type="text"
                        class="form-control"
                        id="username"
                        formControlName="username"
                        placeholder="Enter your username"
                        [ngClass]="{
                          'is-invalid': submitted && f['username'].errors
                        }"
                      />
                    </div>
                    <div
                      *ngIf="submitted && f['username'].errors"
                      class="invalid-feedback d-block"
                    >
                      <div *ngIf="f['username'].errors['required']">
                        Username is required
                      </div>
                    </div>
                  </div>

                  <div class="form-group mb-3">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-lock input-icon"></i>
                      <input
                        type="password"
                        class="form-control"
                        id="password"
                        formControlName="password"
                        placeholder="Enter your password"
                        [ngClass]="{
                          'is-invalid': submitted && f['password'].errors
                        }"
                      />
                    </div>
                    <div
                      *ngIf="submitted && f['password'].errors"
                      class="invalid-feedback d-block"
                    >
                      <div *ngIf="f['password'].errors['required']">
                        Password is required
                      </div>
                    </div>
                  </div>

                  <div class="login-options mb-4">
                    <div class="form-check">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="rememberMe"
                      />
                      <label class="form-check-label" for="rememberMe"
                        >Remember me</label
                      >
                    </div>
                    <a href="#" class="forgot-password">Forgot password?</a>
                  </div>

                  <div class="d-grid mb-4">
                    <button
                      type="submit"
                      class="btn btn-primary login-button"
                      [disabled]="isLoading"
                    >
                      <span
                        *ngIf="isLoading"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </button>
                  </div>
                </form>

                <div class="divider">
                  <span>or continue with</span>
                </div>

                <div class="social-login">
                  <button class="btn social-btn">
                    <i class="bi bi-google"></i>
                  </button>
                  <button class="btn social-btn">
                    <i class="bi bi-facebook"></i>
                  </button>
                  <button class="btn social-btn">
                    <i class="bi bi-apple"></i>
                  </button>
                </div>

                <div class="register-link">
                  Don't have an account?
                  <a routerLink="/register">Register now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        min-height: 100vh;
        background-color: #f8f9fa;
        display: flex;
        align-items: center;
        padding: 20px 0;
      }

      .login-card {
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .login-header {
        background-color: #4361ee;
        color: white;
        text-align: center;
        padding: 25px 20px;
      }

      .login-header h2 {
        margin-bottom: 5px;
        font-weight: 600;
      }

      .login-header p {
        opacity: 0.9;
        margin-bottom: 0;
      }

      .login-body {
        padding: 30px;
      }

      .input-icon-wrapper {
        position: relative;
      }

      .input-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
      }

      .form-control {
        padding: 10px 10px 10px 40px;
        height: auto;
        border-radius: 5px;
      }

      .form-control:focus {
        box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
        border-color: #4361ee;
      }

      .login-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .forgot-password {
        color: #4361ee;
        text-decoration: none;
      }

      .forgot-password:hover {
        text-decoration: underline;
      }

      .login-button {
        background-color: #4361ee;
        border-color: #4361ee;
        padding: 10px;
        font-weight: 500;
        border-radius: 5px;
      }

      .login-button:hover:not(:disabled) {
        background-color: #3a56d4;
        border-color: #3a56d4;
      }

      .divider {
        text-align: center;
        margin: 25px 0;
        position: relative;
      }

      .divider:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background-color: #e0e0e0;
      }

      .divider span {
        position: relative;
        background-color: #ffffff;
        padding: 0 15px;
        color: #6c757d;
        font-size: 14px;
      }

      .social-login {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 25px;
      }

      .social-btn {
        border: 1px solid #e0e0e0;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .social-btn:hover {
        background-color: #f8f9fa;
      }

      .social-btn i {
        font-size: 20px;
      }

      .register-link {
        text-align: center;
        font-size: 15px;
      }

      .register-link a {
        color: #4361ee;
        font-weight: 500;
        text-decoration: none;
      }

      .register-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMessage: string = '';
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Store user data temporarily
          localStorage.setItem('temp_user', JSON.stringify(response.user));
          // Navigate to 2FA verification
          this.router.navigate(['/verify-2fa']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || 'Invalid username or password';
        },
      });
    }
  }
}
