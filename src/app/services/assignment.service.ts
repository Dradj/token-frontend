import { Injectable } from '@angular/core';
import {AssignmentModel} from '../model/assignment.model';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {TeacherCourse} from '../model/teacher-courses.model';
import {SubmittedAssignment} from '../model/submitted-assignment.model';


@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }


  getAssignmentById(id: number): Observable<AssignmentModel> {
    return this.http.get<AssignmentModel>(`${this.apiUrl}/assignments/${id}`);
  }

  getManuals(assignmentId: number): Observable<SubmittedAssignment[]> {
    return this.http.get<SubmittedAssignment[]>(`${this.apiUrl}/assignments/${assignmentId}/materials`);
  }



  getPdfFile(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders({ 'Accept': 'application/pdf' })
    });
  }




  //логика для студентов
  uploadStudentFile(assignmentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/assignments/${assignmentId}/submit`, formData);
  }

  getStudentSubmissions(
    assignmentId: number,
    studentId: number
  ): Observable<SubmittedAssignment[]> {
    // Создаем параметры запроса
    const params = new HttpParams()
      .set('studentId', studentId.toString());

    return this.http.get<SubmittedAssignment[]>(
      `${this.apiUrl}/assignments/${assignmentId}/submissions`,
      { params }
    );
  }

  deleteFile(fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assignments/files/${fileId}`);
  }


  //логика для преподавателей
  getTeacherAssignments() {
    return this.http.get<TeacherCourse[]>(
      `${this.apiUrl}/assignments/teacher`,
      { params: { include: 'groups,students,assignments' } }
    );
  }

  uploadMaterialFile(assignmentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/assignments/${assignmentId}/materials/upload`, formData);
  }

  setGrade(submissionId: number, grade: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assignments/${submissionId}/grade`, { grade });
  }
}


