import { IClassLeaderboard, NewClassLeaderboard } from './class-leaderboard.model';

export const sampleWithRequiredData: IClassLeaderboard = {
  id: 32107,
  rank: 28496,
  totalPoints: 28866,
};

export const sampleWithPartialData: IClassLeaderboard = {
  id: 23268,
  rank: 10743,
  totalPoints: 8684,
};

export const sampleWithFullData: IClassLeaderboard = {
  id: 25082,
  rank: 13516,
  totalPoints: 8106,
};

export const sampleWithNewData: NewClassLeaderboard = {
  rank: 16665,
  totalPoints: 2303,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
