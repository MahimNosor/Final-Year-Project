export interface ITeacher {
  id: number;
  name?: string | null;
  email?: string | null;
}

export type NewTeacher = Omit<ITeacher, 'id'> & { id: null };
