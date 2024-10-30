import { IStudent } from 'app/entities/student/student.model';
import { IStudentClass } from 'app/entities/student-class/student-class.model';

export interface IClassLeaderboard {
  id: number;
  rank?: number | null;
  totalPoints?: number | null;
  student?: IStudent | null;
  studentClass?: IStudentClass | null;
}

export type NewClassLeaderboard = Omit<IClassLeaderboard, 'id'> & { id: null };
