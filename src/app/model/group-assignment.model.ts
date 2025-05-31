import {StudentAssignment} from './student-assignment.model';

export interface GroupAssignment {
  groupId: number;
  groupName: string;
  students: StudentAssignment[];
}
