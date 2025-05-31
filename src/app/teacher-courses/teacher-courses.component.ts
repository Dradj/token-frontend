import {Component, Input} from '@angular/core';
import {TeacherCourse} from '../model/teacher-courses.model';
import {GroupComponent} from '../group/group.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-course',
  templateUrl: './teacher-courses.component.html',
  standalone: true,
  imports: [NgForOf, GroupComponent],
  styleUrls: ['./teacher-courses.component.css']
})
export class CourseComponent {
  @Input() course!: TeacherCourse;
}
