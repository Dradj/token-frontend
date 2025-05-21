import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {Course} from '../model/course.model';
import {environment} from '../../environments/environment';
import {AssignmentModel} from '../model/assignment.model';


@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getCoursesByGroupId(groupId: number): Promise<Course[]> {
    try {
      return await firstValueFrom(
        this.http.get<Course[]>(`${this.apiUrl}/courses/group/${groupId}`)
      );
    } catch (error) {
      console.error('Ошибка при получении курсов:', error);
      return [];
    }
  }

  setSelectedCourseId(courseId: number): void {
    // Сохраняем ID курса в sessionStorage
    sessionStorage.setItem('selectedCourseId', courseId.toString());
  }

  getSelectedCourseId(): number | null {
    // Извлекаем ID курса из sessionStorage
    const storedCourseId = sessionStorage.getItem('selectedCourseId');
    return storedCourseId ? parseInt(storedCourseId, 10) : null;
  }

  getAssignmentsForCourse(courseId: number): Observable<AssignmentModel[]> {
    return this.http.get<AssignmentModel[]>(`${this.apiUrl}/courses/${courseId}/assignments`);
  }
}








