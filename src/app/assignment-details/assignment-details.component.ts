import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AssignmentModel} from '../model/assignment.model';
import {ActivatedRoute, Router} from '@angular/router';
import {AssignmentService} from '../services/assignment.service';
import {UserService} from '../services/user.service';
import {filter, forkJoin, switchMap, take} from 'rxjs';
import {SubmittedAssignment} from '../model/submitted-assignment.model';

@Component({
  selector: 'app-assignment-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.css']
})
export class AssignmentDetailsComponent implements OnInit {
  assignment: AssignmentModel | null = null;
  role: string = '';
  isLoading = false;
  currentUserId: number | null = null;
  isTeacher = false;
  selectedStudentId: number | null = null;

  studentFile: File | null = null;
  studentSubmissions: SubmittedAssignment[] = [];
  manualFile: File | null = null;
  manuals: SubmittedAssignment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Сначала получаем пользователя
    this.userService.currentUser$.pipe(
      filter(user => !!user),
      take(1),
      switchMap(user => {
        // Устанавливаем параметры пользователя
        this.role = user!.role;
        this.isTeacher = this.role === 'ROLE_TEACHER';
        this.currentUserId = user!.id;
        this.selectedStudentId = Number(sessionStorage.getItem('selectedStudentId'));

        // Теперь получаем остальные данные
        const assignmentId = Number(this.route.snapshot.paramMap.get('id'));

        const submissions$ = this.isTeacher && this.selectedStudentId
          ? this.assignmentService.getStudentSubmissions(assignmentId, this.selectedStudentId)
          : this.assignmentService.getStudentSubmissions(assignmentId, this.currentUserId!);

        return forkJoin([
          this.assignmentService.getAssignmentById(assignmentId),
          submissions$,
          this.assignmentService.getManuals(assignmentId)
        ]);
      })
    ).subscribe({
      next: ([assignment, submissions, manuals]) => {
        this.assignment = assignment;
        this.studentSubmissions = submissions;
        this.manuals = manuals;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.isLoading = false;
        if (this.isTeacher) this.router.navigate(['/teacher-dashboard']);
      }
    });
  }


  openPdf(url: string, filename: string): void {
    this.assignmentService.getPdfFile(url).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = filename;
      link.target = '_blank';
      link.click();
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    });
  }

  confirmDelete(file: SubmittedAssignment) {
    if (confirm(`Удалить файл ${file.fileName}?`)) {
      this.assignmentService.deleteFile(file.submissionId).subscribe({
        next: () => {
          this.manuals = this.manuals.filter(f => f.submissionId !== file.submissionId);
          this.studentSubmissions = this.studentSubmissions.filter(f => f.submissionId !== file.submissionId);
        },
        error: (err) => {
          console.error('Ошибка удаления:', err);
          alert('Не удалось удалить файл');
        }
      });
    }
  }

  onStudentFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.studentFile = input.files[0];
  }

  uploadStudent(): void {
    if (!this.assignment?.id || !this.studentFile || !this.currentUserId) return;

    this.isLoading = true;

    this.assignmentService.uploadStudentFile(this.assignment.id, this.studentFile)
      .pipe(
        switchMap(() =>
          this.assignmentService.getStudentSubmissions(this.assignment!.id!, this.currentUserId!)
        )
      )
      .subscribe({
        next: (updatedSubmissions) => {
          this.studentSubmissions = updatedSubmissions;
          this.studentFile = null; // Очищаем выбранный файл
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Ошибка загрузки:', err);
          this.isLoading = false;
        }
      });
  }





  // Метод для выбора файла методички
  onManualFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.manualFile = input.files[0];
    }
  }

// Метод загрузки методички
  uploadManual() {
    if (!this.manualFile || !this.assignment) return;

    // Здесь реализация загрузки на сервер
    this.assignmentService.uploadMaterialFile(this.assignment.id, this.manualFile)
      .pipe(
        switchMap(() =>
          this.assignmentService.getManuals(this.assignment!.id!)
        )
      )
      .subscribe({
        next: (updatedMaterials) => {
          this.manuals = updatedMaterials;
          this.manualFile = null; // Очищаем выбранный файл
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Ошибка загрузки:', err);
          this.isLoading = false;
        }
      });
  }


// Заглушка для метода оценки
  saveGrade(submission: SubmittedAssignment) {
    console.log('Сохранение оценки для:', submission);
    // Реализация сохранения оценки на сервере
  }
}

