import { ITeacher } from 'app/entities/teacher/teacher.model';
import { IStudentClass } from 'app/entities/student-class/student-class.model';
import { IStudent } from 'app/entities/student/student.model';
import { QuestionDifficulty } from 'app/entities/enumerations/question-difficulty.model';
import { ProgrammingLanguage } from 'app/entities/enumerations/programming-language.model';

export interface IQuestion {
  id: number;
  title?: string | null;
  difficulty?: keyof typeof QuestionDifficulty | null;
  description?: string | null;
  solution?: string | null;
  language?: keyof typeof ProgrammingLanguage | null;
  preLoaded?: boolean | null;
  teacher?: ITeacher | null;
  studentClass?: IStudentClass | null;
  students?: IStudent[] | null;
}

export type NewQuestion = Omit<IQuestion, 'id'> & { id: null };
