import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center">Two-Factor Authentication</h2>
              <p class="text-center">
                We've sent a verification code to {{ email }}
              </p>

              <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="code" class="form-label">Verification Code</label>
                  <input
                    type="text"
                    class="form-control"
                    id="code"
                    formControlName="code"
                    placeholder="Enter 6-digit code"
                    maxlength="6"
                    [ngClass]="{
                      'is-invalid': submitted && verifyForm.get('code')?.invalid
                    }"
                  />
                  <div
                    *ngIf="submitted && verifyForm.get('code')?.invalid"
                    class="invalid-feedback"
                  >
                    <div *ngIf="verifyForm.get('code')?.errors?.['required']">
                      Verification code is required
                    </div>
                    <div *ngIf="verifyForm.get('code')?.errors?.['minlength']">
                      Code must be 6 digits
                    </div>
                    <div *ngIf="verifyForm.get('code')?.errors?.['maxlength']">
                      Code must be 6 digits
                    </div>
                  </div>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="verifyForm.invalid || isLoading"
                  >
                    <span
                      *ngIf="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{ isLoading ? 'Verifying...' : 'Verify' }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-link"
                    (click)="resendCode()"
                    [disabled]="isLoading"
                  >
                    {{ isLoading ? 'Sending...' : 'Resend Code' }}
                  </button>
                </div>
              </form>
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
export class Verify2faComponent implements OnInit {
  verifyForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  email = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.verifyForm = this.formBuilder.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit() {
    const tempUser = localStorage.getItem('temp_user');
    if (!tempUser) {
      this.router.navigate(['/register']);
      return;
    }
    this.email = JSON.parse(tempUser).email;
  }

  onSubmit() {
    this.submitted = true;

    if (this.verifyForm.valid) {
      this.isLoading = true;
      const { code } = this.verifyForm.value;

      this.authService.verify2fa(code).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.message === 'Code verified successfully') {
            this.router.navigate(['/complete-registration']);
          } else {
            this.errorMessage = 'Verification failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Verification error:', error);
          if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Verification failed. Please try again.';
          }
        },
      });
    }
  }

  resendCode() {
    this.isLoading = true;
    this.authService.resendVerificationCode().subscribe({
      next: () => {
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Resend code error:', error);
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to resend code. Please try again.';
        }
      },
    });
  }
}
