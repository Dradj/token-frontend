import { Component, Input } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import {GroupAssignment} from '../model/group-assignment.model';
import {SubmittedAssignment} from '../model/submitted-assignment.model';
import {Router} from '@angular/router';


@Component({
  selector: 'app-group',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {
  @Input() group!: GroupAssignment;

  constructor(private router: Router) {}

  // Обработчик клика на задание
  viewStudentAssignment(assignment: SubmittedAssignment, studentId: number): void {
    // Сохраняем studentId в sessionStorage
    sessionStorage.setItem('selectedStudentId', studentId.toString());
    // Переходим на страницу задания
    this.router.navigate(['teacher/assignments', assignment.assignmentId]);
  }
}
