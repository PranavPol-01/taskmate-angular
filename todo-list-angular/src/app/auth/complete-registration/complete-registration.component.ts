import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Complete Registration</h2>
        <form [formGroup]="completeForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="company_code">Company Code</label>
            <input
              type="text"
              id="company_code"
              formControlName="company_code"
              placeholder="Enter company code"
            />
            <div
              *ngIf="
                completeForm.get('company_code')?.invalid &&
                completeForm.get('company_code')?.touched
              "
              class="error"
            >
              Company code is required
            </div>
          </div>

          <div class="form-group" *ngIf="isAdmin">
            <label for="company_name">Company Name</label>
            <input
              type="text"
              id="company_name"
              formControlName="company_name"
              placeholder="Enter company name"
            />
            <div
              *ngIf="
                completeForm.get('company_name')?.invalid &&
                completeForm.get('company_name')?.touched
              "
              class="error"
            >
              Company name is required
            </div>
          </div>

          <button type="submit" [disabled]="completeForm.invalid">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      .card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        margin-bottom: 1.5rem;
        color: #333;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
      }

      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      .error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      button {
        width: 100%;
        padding: 0.75rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
      }

      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      button:hover:not(:disabled) {
        background-color: #0056b3;
      }
    `,
  ],
})
export class CompleteRegistrationComponent implements OnInit {
  completeForm: FormGroup;
  error: string = '';
  loading = false;
  isAdmin = false;
  user: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.completeForm = this.fb.group({
      company_code: ['', Validators.required],
      company_name: [''],
    });
  }

  ngOnInit(): void {
    const tempUser = localStorage.getItem('temp_user');
    if (!tempUser) {
      this.router.navigate(['/register']);
      return;
    }

    this.user = JSON.parse(tempUser);
    this.isAdmin = this.user.role === 'admin';

    if (this.isAdmin) {
      this.completeForm
        .get('company_name')
        ?.setValidators([Validators.required]);
      this.completeForm.get('company_name')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.completeForm.valid) {
      this.loading = true;
      this.error = '';
      const formData = this.completeForm.value;

      // Prepare data for complete registration
      const registrationData = {
        username: this.user.username,
        company_code: formData.company_code,
        ...(this.isAdmin && { company_name: formData.company_name }),
      };

      // Complete registration
      this.authService.completeRegistration(registrationData).subscribe({
        next: (response) => {
          this.loading = false;
          // Store user data and token
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.removeItem('temp_user');
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err.error?.error ||
            'Failed to complete registration. Please try again.';
        },
      });
    }
  }
}
