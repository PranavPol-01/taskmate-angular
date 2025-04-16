// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormsModule,
//   ReactiveFormsModule,
//   FormBuilder,
//   FormGroup,
//   Validators,
// } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { AuthService, LoginResponse } from '../../services/auth.service';

// @Component({
//   selector: 'app-admin-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
//   template: `
//     <div class="container">
//       <div class="row justify-content-center">
//         <div class="col-md-6">
//           <div class="card">
//             <div class="card-body">
//               <h2 class="card-title text-center">Admin Login</h2>
//               <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
//                 <div class="mb-3">
//                   <label for="username" class="form-label">Username</label>
//                   <input
//                     type="text"
//                     class="form-control"
//                     id="username"
//                     formControlName="username"
//                   />
//                   <div
//                     *ngIf="
//                       username.invalid && (username.dirty || username.touched)
//                     "
//                     class="text-danger"
//                   >
//                     <div *ngIf="username.errors?.['required']">
//                       Username is required
//                     </div>
//                   </div>
//                 </div>
//                 <div class="mb-3">
//                   <label for="password" class="form-label">Password</label>
//                   <input
//                     type="password"
//                     class="form-control"
//                     id="password"
//                     formControlName="password"
//                   />
//                   <div
//                     *ngIf="
//                       password.invalid && (password.dirty || password.touched)
//                     "
//                     class="text-danger"
//                   >
//                     <div *ngIf="password.errors?.['required']">
//                       Password is required
//                     </div>
//                   </div>
//                 </div>
//                 <div class="d-grid">
//                   <button
//                     type="submit"
//                     class="btn btn-primary"
//                     [disabled]="loginForm.invalid"
//                   >
//                     Login
//                   </button>
//                 </div>
//                 <div *ngIf="errorMessage" class="alert alert-danger mt-3">
//                   {{ errorMessage }}
//                 </div>
//               </form>
//               <div class="text-center mt-3">
//                 <p>Not an admin? <a routerLink="/login">User Login</a></p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .container {
//         margin-top: 2rem;
//       }
//       .card {
//         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//       }
//       .card-title {
//         margin-bottom: 1.5rem;
//       }
//     `,
//   ],
// })
// export class AdminLoginComponent {
//   loginForm: FormGroup;
//   errorMessage: string = '';

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     this.loginForm = this.fb.group({
//       username: ['', Validators.required],
//       password: ['', Validators.required],
//     });
//   }

//   get username() {
//     return this.loginForm.get('username')!;
//   }
//   get password() {
//     return this.loginForm.get('password')!;
//   }

//   onSubmit() {
//     if (this.loginForm.valid) {
//       const { username, password } = this.loginForm.value;
//       this.authService.adminLogin(username, password).subscribe({
//         next: (response: LoginResponse) => {
//           this.router.navigate(['/admin/dashboard']);
//         },
//         error: (error: { error: { message: string } }) => {
//           this.errorMessage = error.error.message || 'Admin login failed';
//         },
//       });
//     }
//   }
// }
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
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="login-card">
              <div class="login-header admin-header">
                <h2>Admin Portal</h2>
                <p>Enter your admin credentials to continue</p>
              </div>
              
              <div class="login-body">
                <div *ngIf="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>
                
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="form-group mb-3">
                    <label for="username" class="form-label">Admin Username</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-person-badge input-icon"></i>
                      <input
                        type="text"
                        class="form-control"
                        id="username"
                        formControlName="username"
                        placeholder="Enter admin username"
                        [ngClass]="{
                          'is-invalid': username.invalid && (username.dirty || username.touched)
                        }"
                      />
                    </div>
                    <div
                      *ngIf="username.invalid && (username.dirty || username.touched)"
                      class="invalid-feedback d-block"
                    >
                      <div *ngIf="username.errors?.['required']">
                        Username is required
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-group mb-3">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-shield-lock input-icon"></i>
                      <input
                        type="password"
                        class="form-control"
                        id="password"
                        formControlName="password"
                        placeholder="Enter admin password"
                        [ngClass]="{
                          'is-invalid': password.invalid && (password.dirty || password.touched)
                        }"
                      />
                    </div>
                    <div
                      *ngIf="password.invalid && (password.dirty || password.touched)"
                      class="invalid-feedback d-block"
                    >
                      <div *ngIf="password.errors?.['required']">
                        Password is required
                      </div>
                    </div>
                  </div>
                  
                  <div class="login-options mb-4">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="rememberMe">
                      <label class="form-check-label" for="rememberMe">Remember me</label>
                    </div>
                    <a href="#" class="forgot-password">Forgot password?</a>
                  </div>
                  
                  <div class="d-grid mb-4">
                    <button 
                      type="submit" 
                      class="btn btn-primary login-button" 
                      [disabled]="loginForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isLoading ? 'Signing in...' : 'Sign In to Admin' }}
                    </button>
                  </div>
                </form>
                
                <div class="security-notice">
                  <i class="bi bi-shield-check me-2"></i>
                  <span>This is a secure admin-only area</span>
                </div>
                
                <div class="register-link">
                  Not an admin? <a routerLink="/login">Go to User Login</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      color: white;
      text-align: center;
      padding: 25px 20px;
    }
    
    .admin-header {
      background-color: #2c3e50;
      border-bottom: 4px solid #e74c3c;
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
      box-shadow: 0 0 0 0.25rem rgba(231, 76, 60, 0.25);
      border-color: #e74c3c;
    }
    
    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .forgot-password {
      color: #e74c3c;
      text-decoration: none;
    }
    
    .forgot-password:hover {
      text-decoration: underline;
    }
    
    .login-button {
      background-color: #e74c3c;
      border-color: #e74c3c;
      padding: 10px;
      font-weight: 500;
      border-radius: 5px;
    }
    
    .login-button:hover:not(:disabled) {
      background-color: #c0392b;
      border-color: #c0392b;
    }
    
    .security-notice {
      margin: 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      font-size: 14px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    
    .security-notice i {
      color: #2c3e50;
      font-size: 16px;
    }
    
    .register-link {
      text-align: center;
      font-size: 15px;
    }
    
    .register-link a {
      color: #e74c3c;
      font-weight: 500;
      text-decoration: none;
    }
    
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get username() {
    return this.loginForm.get('username')!;
  }
  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      
      this.authService.adminLogin(username, password).subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error: { error: { message: string } }) => {
          this.isLoading = false;
          this.errorMessage = error.error.message || 'Admin login failed';
        },
      });
    }
  }
}