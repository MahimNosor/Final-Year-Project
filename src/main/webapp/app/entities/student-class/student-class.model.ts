import { ITeacher } from 'app/entities/teacher/teacher.model';
import { IStudent } from 'app/entities/student/student.model';

export interface IStudentClass {
  id: number;
  className?: string | null;
  teacher?: ITeacher | null;
  students?: IStudent[] | null;
}

export type NewStudentClass = Omit<IStudentClass, 'id'> & { id: null };
