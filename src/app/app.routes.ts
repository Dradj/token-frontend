import { Routes } from '@angular/router';
//import { authGuard } from './guards/auth.guard';
import {CoursesComponent} from './courses/courses.component';
import {LoginComponent} from './login/login.component';
import {AssignmentListComponent} from './assignment-list/assignment-list.component';
import {MainLayoutComponent} from './main-layout/main-layout.component';
import {AuthLayoutComponent} from './auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    //canActivate: [authGuard],
    children: [
      { path: 'courses', component: CoursesComponent },
      { path: 'courses/assignments', component: AssignmentListComponent },
      // позже сюда можно добавить: оценки, расписание, товары и т.д.
    ],
  },
  { path: '**', redirectTo: 'login' },
];
