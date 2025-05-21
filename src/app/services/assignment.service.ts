import { Injectable } from '@angular/core';
import {AssignmentModel} from '../model/assignment.model';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {UploadedFileModel} from '../model/uploaded-file.model';


@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }


  getAssignmentById(id: number): Observable<AssignmentModel> {
    return this.http.get<AssignmentModel>(`${this.apiUrl}/assignments/${id}`);
  }

  getManuals(assignmentId: number): Observable<UploadedFileModel[]> {
    return this.http.get<UploadedFileModel[]>(`${this.apiUrl}/assignments/${assignmentId}/materials`);
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
  ): Observable<UploadedFileModel[]> {
    // Создаем параметры запроса
    const params = new HttpParams()
      .set('studentId', studentId.toString());

    return this.http.get<UploadedFileModel[]>(
      `${this.apiUrl}/assignments/${assignmentId}/submissions`,
      { params }
    );
  }



  //логика для преподавателей
  getAllStudentsFiles(assignmentId: number): Observable<UploadedFileModel[]> {
    return this.http.get<UploadedFileModel[]>(`${this.apiUrl}/assignments/${assignmentId}/submissions`);
  }

  setGrade(submissionId: number, grade: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assignments/${submissionId}/grade`, { grade });
  }
}


