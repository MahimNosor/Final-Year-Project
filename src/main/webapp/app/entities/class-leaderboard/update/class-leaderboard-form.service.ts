import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IClassLeaderboard, NewClassLeaderboard } from '../class-leaderboard.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IClassLeaderboard for edit and NewClassLeaderboardFormGroupInput for create.
 */
type ClassLeaderboardFormGroupInput = IClassLeaderboard | PartialWithRequiredKeyOf<NewClassLeaderboard>;

type ClassLeaderboardFormDefaults = Pick<NewClassLeaderboard, 'id'>;

type ClassLeaderboardFormGroupContent = {
  id: FormControl<IClassLeaderboard['id'] | NewClassLeaderboard['id']>;
  rank: FormControl<IClassLeaderboard['rank']>;
  totalPoints: FormControl<IClassLeaderboard['totalPoints']>;
  student: FormControl<IClassLeaderboard['student']>;
  studentClass: FormControl<IClassLeaderboard['studentClass']>;
};

export type ClassLeaderboardFormGroup = FormGroup<ClassLeaderboardFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ClassLeaderboardFormService {
  createClassLeaderboardFormGroup(classLeaderboard: ClassLeaderboardFormGroupInput = { id: null }): ClassLeaderboardFormGroup {
    const classLeaderboardRawValue = {
      ...this.getFormDefaults(),
      ...classLeaderboard,
    };
    return new FormGroup<ClassLeaderboardFormGroupContent>({
      id: new FormControl(
        { value: classLeaderboardRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      rank: new FormControl(classLeaderboardRawValue.rank, {
        validators: [Validators.required],
      }),
      totalPoints: new FormControl(classLeaderboardRawValue.totalPoints, {
        validators: [Validators.required],
      }),
      student: new FormControl(classLeaderboardRawValue.student),
      studentClass: new FormControl(classLeaderboardRawValue.studentClass),
    });
  }

  getClassLeaderboard(form: ClassLeaderboardFormGroup): IClassLeaderboard | NewClassLeaderboard {
    return form.getRawValue() as IClassLeaderboard | NewClassLeaderboard;
  }

  resetForm(form: ClassLeaderboardFormGroup, classLeaderboard: ClassLeaderboardFormGroupInput): void {
    const classLeaderboardRawValue = { ...this.getFormDefaults(), ...classLeaderboard };
    form.reset(
      {
        ...classLeaderboardRawValue,
        id: { value: classLeaderboardRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ClassLeaderboardFormDefaults {
    return {
      id: null,
    };
  }
}
