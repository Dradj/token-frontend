import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CourseService} from '../services/course.service';
import {AuthService} from '../services/auth.service';
import {AssignmentModel} from '../model/assignment.model';
import {filter, of, switchMap, take} from 'rxjs';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink],
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css']
})
export class AssignmentListComponent implements OnInit {
  assignments: AssignmentModel[] = [];
  errorMessage: string | null = null;
  loading = true;

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(
        filter(isAuth => isAuth), // ждём, пока авторизация будет true
        take(1), // подписываемся только один раз
        switchMap(() => {
          const courseId = this.courseService.getSelectedCourseId();
          if (!courseId) {
            this.errorMessage = 'Курс не выбран';
            this.loading = false;
            return of([]); // пустой observable если нет курса
          }
          return this.courseService.getAssignmentsForCourse(courseId);
        })
      )
      .subscribe({
        next: (assignments) => {
          this.assignments = assignments;
          this.loading = false;
        },
        error: (err) => {
          console.error('Ошибка при получении заданий:', err);
          this.errorMessage = 'Не удалось загрузить задания';
          this.loading = false;
        }
      });
  }
}





