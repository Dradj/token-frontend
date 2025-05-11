import {Component, OnInit} from '@angular/core';
import {CourseService} from '../services/course.service';
import {AuthService} from '../services/auth.service';
import {Course} from '../model/course.model';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

import { Router } from '@angular/router';
import {filter, firstValueFrom, take} from 'rxjs';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
  imports: [NgForOf, NgIf],
  standalone: true
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    private courseService: CourseService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.userService.currentUser$.pipe(
          filter(user => !!user),
          take(1)
        )
      );

      if (!user.groupId) {
        this.errorMessage = 'Группа пользователя не указана';
        return;
      }

      this.courses = await this.courseService.getCoursesByGroupId(user.groupId);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      this.errorMessage = 'Не удалось загрузить курсы';
    } finally {
      this.loading = false;
    }
  }

  async goToAssignments(courseId: number): Promise<void> {
    this.courseService.setSelectedCourseId(courseId);
    await this.router.navigate(['/courses/assignments']);
  }
}







