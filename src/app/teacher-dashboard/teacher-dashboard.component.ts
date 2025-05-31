import { Component, OnInit } from '@angular/core';
import { AssignmentService } from '../services/assignment.service';
import {NgForOf, NgIf} from '@angular/common';
import {TeacherCourse} from '../model/teacher-courses.model';
import {CourseComponent} from '../teacher-courses/teacher-courses.component';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  standalone: true,
  imports: [
    NgIf,
    CourseComponent,
    NgForOf
  ],
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  courses: TeacherCourse[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private assignmentService: AssignmentService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.assignmentService.getTeacherAssignments().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Ошибка загрузки данных';
        this.isLoading = false;
      }
    });
  }
}
