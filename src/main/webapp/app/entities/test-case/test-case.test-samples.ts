import { ITestCase, NewTestCase } from './test-case.model';

export const sampleWithRequiredData: ITestCase = {
  id: 7516,
  input: 'pish',
  expectedOutput: 'whole truthfully',
};

export const sampleWithPartialData: ITestCase = {
  id: 8192,
  input: 'radiant',
  expectedOutput: 'daily hm',
  description: 'retrospectivity deliberately',
};

export const sampleWithFullData: ITestCase = {
  id: 21659,
  input: 'before from',
  expectedOutput: 'miserably brightly',
  description: 'deadly',
};

export const sampleWithNewData: NewTestCase = {
  input: 'phew jacket',
  expectedOutput: 'whoever behind while',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
