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
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center">Complete Registration</h2>
              <p class="text-center">
                Please provide your company information to complete registration
              </p>

              <form [formGroup]="completeForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="company_code" class="form-label"
                    >Company Code</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="company_code"
                    formControlName="company_code"
                    [ngClass]="{
                      'is-invalid':
                        submitted && completeForm.get('company_code')?.invalid
                    }"
                  />
                  <div
                    *ngIf="
                      submitted && completeForm.get('company_code')?.invalid
                    "
                    class="invalid-feedback"
                  >
                    <div
                      *ngIf="completeForm.get('company_code')?.errors?.['required']"
                    >
                      Company code is required
                    </div>
                  </div>
                </div>

                <div *ngIf="isAdmin" class="mb-3">
                  <label for="company_name" class="form-label"
                    >Company Name</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="company_name"
                    formControlName="company_name"
                    [ngClass]="{
                      'is-invalid':
                        submitted && completeForm.get('company_name')?.invalid
                    }"
                  />
                  <div
                    *ngIf="
                      submitted && completeForm.get('company_name')?.invalid
                    "
                    class="invalid-feedback"
                  >
                    <div
                      *ngIf="completeForm.get('company_name')?.errors?.['required']"
                    >
                      Company name is required for admin users
                    </div>
                  </div>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="completeForm.invalid || isLoading"
                  >
                    <span
                      *ngIf="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{ isLoading ? 'Completing...' : 'Complete Registration' }}
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
export class CompleteRegistrationComponent implements OnInit {
  completeForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  isAdmin = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.completeForm = this.formBuilder.group({
      company_code: ['', Validators.required],
      company_name: [''],
    });
  }

  ngOnInit() {
    const tempUser = localStorage.getItem('temp_user');
    if (!tempUser) {
      this.router.navigate(['/register']);
      return;
    }

    const user = JSON.parse(tempUser);
    this.isAdmin = user.role === 'admin';

    if (this.isAdmin) {
      this.completeForm
        .get('company_name')
        ?.setValidators([Validators.required]);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.completeForm.valid) {
      this.isLoading = true;
      const { company_code, company_name } = this.completeForm.value;
      const tempUser = JSON.parse(localStorage.getItem('temp_user') || '{}');

      this.authService
        .completeRegistration({
          username: tempUser.username,
          company_code,
          company_name: this.isAdmin ? company_name : undefined,
        })
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            localStorage.removeItem('temp_user');
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Complete registration error:', error);
            if (error.error?.error) {
              this.errorMessage = error.error.error;
            } else if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage =
                'Failed to complete registration. Please try again.';
            }
          },
        });
    }
  }
}
