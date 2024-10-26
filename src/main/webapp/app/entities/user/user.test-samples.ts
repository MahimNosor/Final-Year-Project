import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: 28264,
  login: 'XCUa`@8umMeO',
};

export const sampleWithPartialData: IUser = {
  id: 32655,
  login: 'd8GOT',
};

export const sampleWithFullData: IUser = {
  id: 10790,
  login: 'Y',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
