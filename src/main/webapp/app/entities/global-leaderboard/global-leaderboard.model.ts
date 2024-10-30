import { IStudent } from 'app/entities/student/student.model';

export interface IGlobalLeaderboard {
  id: number;
  rank?: number | null;
  totalPoints?: number | null;
  student?: IStudent | null;
}

export type NewGlobalLeaderboard = Omit<IGlobalLeaderboard, 'id'> & { id: null };
