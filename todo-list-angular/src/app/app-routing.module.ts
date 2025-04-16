import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth.guard';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AdminLoginComponent } from './auth/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './auth/admin.guard';
import { TaskDetailsComponent } from './dashboard/task-details/task-details.component';
import { AdminTaskDetailsComponent } from './admin/admin-task-details/admin-task-details.component';
import { ProfileComponent } from './profile/profile.component';
import { CompleteRegistrationComponent } from './auth/complete-registration/complete-registration.component';
import { CreateTaskComponent } from './admin/create-task/create-task.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  // Public routes
  // { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: '', component: LandingPageComponent },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'complete-registration', component: CompleteRegistrationComponent },
  { path: 'admin/login', component: AdminLoginComponent },

  // User protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'task/:id',
    component: TaskDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },

  // Admin protected routes
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/create-task',
    component: CreateTaskComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/task/:id',
    component: AdminTaskDetailsComponent,
    canActivate: [AdminGuard],
  },

  // Fallback route
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
