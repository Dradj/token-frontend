import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AssignmentModel} from '../model/assignment.model';
import {UploadedFileModel} from '../model/uploaded-file.model';
import {ActivatedRoute} from '@angular/router';
import {AssignmentService} from '../services/assignment.service';
import {UserService} from '../services/user.service';
import {filter, forkJoin, switchMap, take} from 'rxjs';

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

  studentFile: File | null = null;

  studentSubmissions: UploadedFileModel[] = [];
  manuals: UploadedFileModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private assignmentStudentService: AssignmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;

    this.userService.currentUser$.pipe(
      filter(user => !!user),
      take(1),
      switchMap(user => {
        this.role = user!.role;
        this.currentUserId = user!.id; // Сохраняем ID пользователя
        return forkJoin([
          this.assignmentStudentService.getAssignmentById(assignmentId),
          this.assignmentStudentService.getStudentSubmissions(assignmentId, user!.id),
          this.assignmentStudentService.getManuals(assignmentId)
        ]);
      })
    ).subscribe({
      next: ([assignment, studentSubmissions, manuals]) => {
        this.assignment = assignment;
        this.studentSubmissions = studentSubmissions;
        this.manuals = manuals;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.isLoading = false;
      }
    });
  }


  openPdf(url: string, filename: string): void {
    this.assignmentStudentService.getPdfFile(url).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);

      // Создаем временную ссылку с правильным именем
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = filename; // Указываем имя файла
      link.target = '_blank';
      link.click();

      // Очистка через 1 сек
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    });
  }





  private reloadFiles(id: number): void {
    if (!this.currentUserId) return; // Проверяем наличие ID пользователя

    this.isLoading = true;
    forkJoin([
      this.assignmentStudentService.getStudentSubmissions(id, this.currentUserId),
      this.assignmentStudentService.getManuals(id)
    ]).subscribe({
      next: ([studentList, manualsList]) => {
        this.studentSubmissions = studentList;
        this.manuals = manualsList;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error reloading files:', err);
        this.isLoading = false;
      }
    });
  }

  onStudentFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.studentFile = input.files[0];
  }

  uploadStudent(): void {
    if (!this.assignment?.id || !this.studentFile) return;
    this.isLoading = true;
    this.assignmentStudentService.uploadStudentFile(this.assignment.id, this.studentFile)
      .subscribe({
        next: () => this.reloadFiles(this.assignment!.id),
        error: () => this.isLoading = false
      });
  }
}

