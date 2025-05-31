import {GroupAssignment} from "./group-assignment.model";

export interface TeacherCourse {
  courseId: number;
  courseName: string;
  groups: GroupAssignment[];
}



