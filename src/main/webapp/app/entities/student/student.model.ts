import { IQuestion } from 'app/entities/question/question.model';
import { IStudentClass } from 'app/entities/student-class/student-class.model';

export interface IStudent {
  id: number;
  name?: string | null;
  email?: string | null;
  points?: number | null;
  questions?: IQuestion[] | null;
  classes?: IStudentClass[] | null;
}

export type NewStudent = Omit<IStudent, 'id'> & { id: null };
