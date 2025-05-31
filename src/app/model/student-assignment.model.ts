import {SubmittedAssignment} from './submitted-assignment.model';

export interface StudentAssignment {
  studentId: number;
  studentName: string;
  assignments: SubmittedAssignment[];
}

