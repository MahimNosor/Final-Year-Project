import { IQuestion } from 'app/entities/question/question.model';

export interface ITestCase {
  id: number;
  input?: string | null;
  expectedOutput?: string | null;
  description?: string | null;
  question?: IQuestion | null;
}

export type NewTestCase = Omit<ITestCase, 'id'> & { id: null };
