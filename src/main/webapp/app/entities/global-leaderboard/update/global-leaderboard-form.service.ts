import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IGlobalLeaderboard, NewGlobalLeaderboard } from '../global-leaderboard.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IGlobalLeaderboard for edit and NewGlobalLeaderboardFormGroupInput for create.
 */
type GlobalLeaderboardFormGroupInput = IGlobalLeaderboard | PartialWithRequiredKeyOf<NewGlobalLeaderboard>;

type GlobalLeaderboardFormDefaults = Pick<NewGlobalLeaderboard, 'id'>;

type GlobalLeaderboardFormGroupContent = {
  id: FormControl<IGlobalLeaderboard['id'] | NewGlobalLeaderboard['id']>;
  rank: FormControl<IGlobalLeaderboard['rank']>;
  totalPoints: FormControl<IGlobalLeaderboard['totalPoints']>;
  student: FormControl<IGlobalLeaderboard['student']>;
};

export type GlobalLeaderboardFormGroup = FormGroup<GlobalLeaderboardFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class GlobalLeaderboardFormService {
  createGlobalLeaderboardFormGroup(globalLeaderboard: GlobalLeaderboardFormGroupInput = { id: null }): GlobalLeaderboardFormGroup {
    const globalLeaderboardRawValue = {
      ...this.getFormDefaults(),
      ...globalLeaderboard,
    };
    return new FormGroup<GlobalLeaderboardFormGroupContent>({
      id: new FormControl(
        { value: globalLeaderboardRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      rank: new FormControl(globalLeaderboardRawValue.rank, {
        validators: [Validators.required],
      }),
      totalPoints: new FormControl(globalLeaderboardRawValue.totalPoints, {
        validators: [Validators.required],
      }),
      student: new FormControl(globalLeaderboardRawValue.student),
    });
  }

  getGlobalLeaderboard(form: GlobalLeaderboardFormGroup): IGlobalLeaderboard | NewGlobalLeaderboard {
    return form.getRawValue() as IGlobalLeaderboard | NewGlobalLeaderboard;
  }

  resetForm(form: GlobalLeaderboardFormGroup, globalLeaderboard: GlobalLeaderboardFormGroupInput): void {
    const globalLeaderboardRawValue = { ...this.getFormDefaults(), ...globalLeaderboard };
    form.reset(
      {
        ...globalLeaderboardRawValue,
        id: { value: globalLeaderboardRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): GlobalLeaderboardFormDefaults {
    return {
      id: null,
    };
  }
}
