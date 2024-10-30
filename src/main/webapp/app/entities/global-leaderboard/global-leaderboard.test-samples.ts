import { IGlobalLeaderboard, NewGlobalLeaderboard } from './global-leaderboard.model';

export const sampleWithRequiredData: IGlobalLeaderboard = {
  id: 17684,
  rank: 23495,
  totalPoints: 10673,
};

export const sampleWithPartialData: IGlobalLeaderboard = {
  id: 1974,
  rank: 7665,
  totalPoints: 2570,
};

export const sampleWithFullData: IGlobalLeaderboard = {
  id: 20966,
  rank: 5121,
  totalPoints: 9120,
};

export const sampleWithNewData: NewGlobalLeaderboard = {
  rank: 9286,
  totalPoints: 12812,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
