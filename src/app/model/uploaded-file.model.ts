export interface UploadedFileModel {
  fileId: number;
  fileName: string;
  downloadUrl: string;
  studentId?: number; // для сдач
}
