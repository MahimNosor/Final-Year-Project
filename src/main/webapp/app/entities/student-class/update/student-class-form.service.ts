import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IStudentClass, NewStudentClass } from '../student-class.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IStudentClass for edit and NewStudentClassFormGroupInput for create.
 */
type StudentClassFormGroupInput = IStudentClass | PartialWithRequiredKeyOf<NewStudentClass>;

type StudentClassFormDefaults = Pick<NewStudentClass, 'id' | 'students'>;

type StudentClassFormGroupContent = {
  id: FormControl<IStudentClass['id'] | NewStudentClass['id']>;
  className: FormControl<IStudentClass['className']>;
  teacher: FormControl<IStudentClass['teacher']>;
  students: FormControl<IStudentClass['students']>;
};

export type StudentClassFormGroup = FormGroup<StudentClassFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class StudentClassFormService {
  createStudentClassFormGroup(studentClass: StudentClassFormGroupInput = { id: null }): StudentClassFormGroup {
    const studentClassRawValue = {
      ...this.getFormDefaults(),
      ...studentClass,
    };
    return new FormGroup<StudentClassFormGroupContent>({
      id: new FormControl(
        { value: studentClassRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      className: new FormControl(studentClassRawValue.className, {
        validators: [Validators.required],
      }),
      teacher: new FormControl(studentClassRawValue.teacher),
      students: new FormControl(studentClassRawValue.students ?? []),
    });
  }

  getStudentClass(form: StudentClassFormGroup): IStudentClass | NewStudentClass {
    return form.getRawValue() as IStudentClass | NewStudentClass;
  }

  resetForm(form: StudentClassFormGroup, studentClass: StudentClassFormGroupInput): void {
    const studentClassRawValue = { ...this.getFormDefaults(), ...studentClass };
    form.reset(
      {
        ...studentClassRawValue,
        id: { value: studentClassRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): StudentClassFormDefaults {
    return {
      id: null,
      students: [],
    };
  }
}
