import { IStudent, NewStudent } from './student.model';

export const sampleWithRequiredData: IStudent = {
  id: 18951,
  name: 'nougat blah',
  email: 'Constantin_Mayert6@yahoo.com',
};

export const sampleWithPartialData: IStudent = {
  id: 17698,
  name: 'mortally against',
  email: 'Ramon22@yahoo.com',
  points: 14170,
};

export const sampleWithFullData: IStudent = {
  id: 3593,
  name: 'roughly around per',
  email: 'Janiya90@yahoo.com',
  points: 24235,
};

export const sampleWithNewData: NewStudent = {
  name: 'per alongside heartbeat',
  email: 'Keyon.Kohler12@yahoo.com',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
