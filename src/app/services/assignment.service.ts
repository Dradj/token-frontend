import { Injectable } from '@angular/core';
import {AssignmentModel} from '../model/assignment.model';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  async getAssignmentsForCourse(courseId: number): Promise<AssignmentModel[]> {
    try {
      // Используем firstValueFrom для получения данных как синхронного результата
      return await firstValueFrom(
        this.http.get<AssignmentModel[]>(`${this.apiUrl}/courses/${courseId}/assignments`)
      );
    } catch (error) {
      console.error('Ошибка при получении заданий:', error);
      return [];  // Возвращаем пустой массив в случае ошибки
    }
  }
}


