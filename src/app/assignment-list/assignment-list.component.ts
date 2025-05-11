import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NgForOf, NgIf} from '@angular/common';
import {CourseService} from '../services/course.service';
import {AuthService} from '../services/auth.service';
import {AssignmentModel} from '../model/assignment.model';
import {firstValueFrom} from 'rxjs';
import {AssignmentService} from '../services/assignment.service';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css']
})
export class AssignmentListComponent implements OnInit {
  assignments: AssignmentModel[] = [];
  errorMessage: string | null = null;
  loading = true;

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService
  ) {}

  async ngOnInit(): Promise<void> {
    const courseId = this.courseService.getSelectedCourseId();

    if (!courseId) {
      this.errorMessage = 'Курс не выбран';
      this.loading = false;
      return;
    }

    try {
      // Используем async/await для получения заданий
      this.assignments = await this.assignmentService.getAssignmentsForCourse(courseId);
    } catch (err) {
      console.error('Ошибка при получении заданий:', err);
      this.errorMessage = 'Не удалось загрузить задания';
    } finally {
      this.loading = false;
    }
  }
}




