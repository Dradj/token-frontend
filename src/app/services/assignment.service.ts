import { Injectable } from '@angular/core';
import {AssignmentModel} from '../model/assignment.model';
import {firstValueFrom, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAssignmentsForCourse(courseId: number): Observable<AssignmentModel[]> {
    return this.http.get<AssignmentModel[]>(`${this.apiUrl}/courses/${courseId}/assignments`);
  }

}


