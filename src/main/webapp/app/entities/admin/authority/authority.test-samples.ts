import { IAuthority, NewAuthority } from './authority.model';

export const sampleWithRequiredData: IAuthority = {
  name: '742645b5-cc3e-4da9-b13c-d5c68de78209',
};

export const sampleWithPartialData: IAuthority = {
  name: '1165945d-4211-46c6-a890-ce4534186008',
};

export const sampleWithFullData: IAuthority = {
  name: '15c317da-3f7b-49a4-8e06-3d3a003b1c9e',
};

export const sampleWithNewData: NewAuthority = {
  name: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
