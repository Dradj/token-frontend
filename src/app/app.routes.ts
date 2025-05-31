import { Routes } from '@angular/router';
import {CoursesComponent} from './courses/courses.component';
import {LoginComponent} from './login/login.component';
import {AssignmentListComponent} from './assignment-list/assignment-list.component';
import {MainLayoutComponent} from './main-layout/main-layout.component';
import {AuthLayoutComponent} from './auth-layout/auth-layout.component';
import {LoginRedirectGuard} from './guards/login-redirect.guard';
import {AuthGuard} from './guards/auth.guard';
import {AssignmentDetailsComponent} from './assignment-details/assignment-details.component';
import {TeacherDashboardComponent} from './teacher-dashboard/teacher-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginRedirectGuard]
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'teacher-dashboard', component: TeacherDashboardComponent
      },
      { path: 'courses', component: CoursesComponent },
      { path: 'courses/assignments', component: AssignmentListComponent },
      {
        path: 'teacher/assignments/:id', component: AssignmentDetailsComponent
      },
      {
        path: 'assignments/:id', component: AssignmentDetailsComponent
      },
      // можно добавлять другие защищённые страницы здесь
    ],
  },
  { path: '**', redirectTo: 'login' },
];

