import { IStudentClass, NewStudentClass } from './student-class.model';

export const sampleWithRequiredData: IStudentClass = {
  id: 8258,
  className: 'gah yahoo wherever',
};

export const sampleWithPartialData: IStudentClass = {
  id: 31037,
  className: 'frozen weird',
};

export const sampleWithFullData: IStudentClass = {
  id: 32119,
  className: 'after',
};

export const sampleWithNewData: NewStudentClass = {
  className: 'palatable plus',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
