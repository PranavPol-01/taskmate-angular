import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CompanyResponse {
  message: string;
  company: {
    id: string;
    name: string;
    code: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface CompleteRegistrationResponse {
  message: string;
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    company_code: string;
  };
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    company_code: string;
  };
}

export interface LoginForm {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private getRequestOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true,
    };
  }

  register(
    username: string,
    email: string,
    password: string,
    role: string
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/auth/register`,
      {
        username,
        email,
        password,
        role,
      },
      { withCredentials: true }
    );
  }

  completeRegistration(data: {
    username: string;
    company_code: string;
    company_name?: string;
  }): Observable<CompleteRegistrationResponse> {
    return this.http.post<CompleteRegistrationResponse>(
      `${this.apiUrl}/auth/complete-registration`,
      data,
      { withCredentials: true }
    );
  }

  registerAdmin(
    username: string,
    email: string,
    password: string,
    company_code: string
  ): Observable<RegisterResponse> {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      return throwError(() => new Error('Admin token not found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    });

    return this.http
      .post<RegisterResponse>(
        `${this.apiUrl}/register/admin`,
        { username, email, password, company_code },
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Admin registration error:', error);
          return throwError(() => error);
        })
      );
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/auth/login`,
        {
          username,
          password,
        },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  adminLogin(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/admin/login`,
        { username, password },
        
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
         
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            console.log(this.currentUserSubject.value?.role);
        }),
        catchError((error) => {
          console.error('Admin login error:', error);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUserData(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    console.log(this.currentUserSubject.value?.role);
    return this.currentUserSubject.value?.role === 'admin';
  }

  createCompany(companyName: string, companyCode: string) {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      return throwError(() => new Error('Admin token not found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    });

    return this.http
      .post<CompanyResponse>(
        `${this.apiUrl}/admin/company`,
        { name: companyName, code: companyCode },
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Company creation error:', error);
          return throwError(() => error);
        })
      );
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put(`${this.apiUrl}/users/${userId}/role`, { role }, { headers })
      .pipe(
        catchError((error) => {
          console.error('Role update error:', error);
          return throwError(() => error);
        })
      );
  }
}
