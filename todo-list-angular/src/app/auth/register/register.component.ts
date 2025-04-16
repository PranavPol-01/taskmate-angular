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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8">
          <div class="card border-0 shadow-lg rounded-3">
            <div class="card-header bg-primary text-white text-center py-3">
              <h2 class="mb-0 fw-bold">Create Account</h2>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div
                  *ngIf="errorMessage"
                  class="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  <i class="bi bi-exclamation-triangle-fill me-2"></i
                  >{{ errorMessage }}
                  <button
                    type="button"
                    class="btn-close"
                    (click)="clearError()"
                  ></button>
                </div>

                <!-- Username field -->
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    formControlName="username"
                    placeholder="Username"
                    [ngClass]="{
                      'is-invalid':
                        (submitted || username.touched) && username.invalid
                    }"
                  />
                  <label for="username">Username</label>
                  <div class="invalid-feedback">
                    <div *ngIf="username.errors?.['required']">
                      Username is required
                    </div>
                    <div *ngIf="username.errors?.['minlength']">
                      Username must be at least 3 characters
                    </div>
                  </div>
                </div>

                <!-- Email field -->
                <div class="form-floating mb-3">
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    placeholder="Email"
                    [ngClass]="{
                      'is-invalid':
                        (submitted || email.touched) && email.invalid
                    }"
                  />
                  <label for="email">Email address</label>
                  <div class="invalid-feedback">
                    <div *ngIf="email.errors?.['required']">
                      Email is required
                    </div>
                    <div *ngIf="email.errors?.['email']">
                      Please enter a valid email
                    </div>
                  </div>
                </div>

                <!-- Password field -->
                <div class="form-floating mb-3">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    formControlName="password"
                    placeholder="Password"
                    [ngClass]="{
                      'is-invalid':
                        (submitted || password.touched) && password.invalid
                    }"
                  />
                  <label for="password">Password</label>
                  <button
                    type="button"
                    class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none"
                    style="z-index: 5"
                    (click)="togglePasswordVisibility('password')"
                  >
                    <i
                      class="bi"
                      [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                    ></i>
                  </button>
                  <div class="invalid-feedback">
                    <div *ngIf="password.errors?.['required']">
                      Password is required
                    </div>
                    <div *ngIf="password.errors?.['minlength']">
                      Password must be at least 6 characters
                    </div>
                  </div>
                </div>

                <!-- Password strength indicator -->
                <div class="mb-3" *ngIf="password.value">
                  <div class="d-flex justify-content-between mb-1">
                    <small>Password strength:</small>
                    <small>{{ getPasswordStrength() }}</small>
                  </div>
                  <div class="progress" style="height: 5px;">
                    <div
                      class="progress-bar"
                      [ngClass]="getPasswordStrengthClass()"
                      [style.width.%]="calculatePasswordStrength()"
                    ></div>
                  </div>
                </div>

                <!-- Confirm Password field -->
                <div class="form-floating mb-3">
                  <input
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    placeholder="Confirm Password"
                    [ngClass]="{ 'is-invalid': (submitted || confirmPassword.touched) && 
                      (confirmPassword.invalid || registerForm.errors?.['mismatch']) }"
                  />
                  <label for="confirmPassword">Confirm Password</label>
                  <button
                    type="button"
                    class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none"
                    style="z-index: 5"
                    (click)="togglePasswordVisibility('confirm')"
                  >
                    <i
                      class="bi"
                      [ngClass]="
                        showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'
                      "
                    ></i>
                  </button>
                  <div class="invalid-feedback">
                    <div *ngIf="confirmPassword.errors?.['required']">
                      Please confirm your password
                    </div>
                    <div *ngIf="registerForm.errors?.['mismatch']">
                      Passwords do not match
                    </div>
                  </div>
                </div>

                <!-- Role selector -->
                <div class="form-floating mb-4">
                  <select
                    class="form-select"
                    id="role"
                    formControlName="role"
                    [ngClass]="{
                      'is-invalid': (submitted || role.touched) && role.invalid
                    }"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <label for="role">Select Role</label>
                </div>

                <!-- Terms & Conditions checkbox -->
                <div class="form-check mb-4">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="termsAccepted"
                    formControlName="termsAccepted"
                    [ngClass]="{
                      'is-invalid': submitted && termsAccepted.invalid
                    }"
                  />
                  <label class="form-check-label" for="termsAccepted">
                    I agree to the
                    <a href="#" class="text-decoration-none"
                      >Terms of Service</a
                    >
                    and
                    <a href="#" class="text-decoration-none">Privacy Policy</a>
                  </label>
                  <div class="invalid-feedback">
                    You must agree to the terms and conditions
                  </div>
                </div>

                <!-- Submit button -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    [disabled]="isLoading"
                  >
                    <span
                      *ngIf="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                    <span>{{
                      isLoading ? 'Creating Account...' : 'Sign Up'
                    }}</span>
                  </button>
                </div>
              </form>

              <!-- Login link -->
              <div class="text-center mt-4">
                <p class="mb-0">
                  Already have an account?
                  <a
                    routerLink="/login"
                    class="text-primary fw-bold text-decoration-none"
                    >Sign In</a
                  >
                </p>
              </div>

              <!-- Social login options -->
              <div class="mt-4 pt-3 border-top">
                <p class="text-center text-muted">Or sign up with</p>
                <div class="d-flex justify-content-center gap-3">
                  <button class="btn btn-outline-secondary">
                    <i class="bi bi-google"></i>
                  </button>
                  <button class="btn btn-outline-secondary">
                    <i class="bi bi-facebook"></i>
                  </button>
                  <button class="btn btn-outline-secondary">
                    <i class="bi bi-apple"></i>
                  </button>
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
      :host {
        display: block;
        background-color: #f8f9fa;
        min-height: 100vh;
        padding: 2rem 0;
      }

      .card {
        transition: all 0.3s ease;
      }

      .card:hover {
        transform: translateY(-5px);
      }

      .form-floating > .form-control,
      .form-floating > .form-select {
        height: calc(3.5rem + 2px);
        line-height: 1.25;
      }

      .form-floating > label {
        padding: 1rem 0.75rem;
      }

      .btn-primary {
        background-color: #4361ee;
        border-color: #4361ee;
        transition: all 0.3s ease;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #3a56d4;
        border-color: #3a56d4;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
      }

      .btn-outline-secondary {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
      }

      .btn-outline-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .invalid-feedback {
        font-size: 0.75rem;
      }

      /* Password visibility button positioning fix */
      .form-floating {
        position: relative;
      }
    `,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: ['user', Validators.required],
        termsAccepted: [false, Validators.requiredTrue],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Add Bootstrap icons stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css';
    document.head.appendChild(link);
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get username() {
    return this.registerForm.get('username')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  get role() {
    return this.registerForm.get('role')!;
  }

  get termsAccepted() {
    return this.registerForm.get('termsAccepted')!;
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  clearError() {
    this.errorMessage = '';
  }

  calculatePasswordStrength(): number {
    const password = this.password.value;
    if (!password) return 0;

    // Basic calculation based on length and character types
    let strength = 0;

    // Length check (max 40%)
    strength += Math.min(40, (password.length / 10) * 40);

    // Character variety checks (20% each)
    if (/[A-Z]/.test(password)) strength += 20; // uppercase
    if (/[0-9]/.test(password)) strength += 20; // numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // special chars

    return strength;
  }

  getPasswordStrength(): string {
    const strength = this.calculatePasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  }

  getPasswordStrengthClass(): string {
    const strength = this.calculatePasswordStrength();
    if (strength < 40) return 'bg-danger';
    if (strength < 70) return 'bg-warning';
    return 'bg-success';
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.valid) {
      this.isLoading = true;
      const { username, email, password, role, company_code } =
        this.registerForm.value;

      this.authService
        .register(username, email, password, role, company_code)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            // Store user data temporarily
            localStorage.setItem(
              'temp_user',
              JSON.stringify({
                username: username,
                email: email,
                role: role,
                company_code: company_code,
              })
            );
            // Navigate to complete registration page
            this.router.navigate(['/complete-registration']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Registration error:', error);
            if (error.error?.error) {
              this.errorMessage = error.error.error;
            } else if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'Registration failed. Please try again.';
            }
          },
        });
    } else {
      // Trigger validation on all form fields
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
