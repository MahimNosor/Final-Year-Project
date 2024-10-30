import { IQuestion, NewQuestion } from './question.model';

export const sampleWithRequiredData: IQuestion = {
  id: 24068,
  title: 'jungle',
  difficulty: 'MEDIUM',
  description: '../fake-data/blob/hipster.txt',
  language: 'JAVASCRIPT',
  preLoaded: false,
};

export const sampleWithPartialData: IQuestion = {
  id: 18738,
  title: 'yowza',
  difficulty: 'BEGINNER',
  description: '../fake-data/blob/hipster.txt',
  language: 'CSHARP',
  preLoaded: true,
};

export const sampleWithFullData: IQuestion = {
  id: 6809,
  title: 'following though',
  difficulty: 'BEGINNER',
  description: '../fake-data/blob/hipster.txt',
  solution: '../fake-data/blob/hipster.txt',
  language: 'CSHARP',
  preLoaded: false,
};

export const sampleWithNewData: NewQuestion = {
  title: 'along truly hopelessly',
  difficulty: 'BEGINNER',
  description: '../fake-data/blob/hipster.txt',
  language: 'PYTHON',
  preLoaded: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
