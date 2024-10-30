import { ITeacher, NewTeacher } from './teacher.model';

export const sampleWithRequiredData: ITeacher = {
  id: 29791,
  name: 'gah understated',
  email: 'Brady6@yahoo.com',
};

export const sampleWithPartialData: ITeacher = {
  id: 9424,
  name: 'oxygenate mobilize',
  email: 'Lora_Koss@gmail.com',
};

export const sampleWithFullData: ITeacher = {
  id: 81,
  name: 'finally',
  email: 'Don_Flatley29@yahoo.com',
};

export const sampleWithNewData: NewTeacher = {
  name: 'foolishly pace premier',
  email: 'Jordane.Waters@hotmail.com',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
