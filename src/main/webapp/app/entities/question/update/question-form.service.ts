import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IQuestion, NewQuestion } from '../question.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IQuestion for edit and NewQuestionFormGroupInput for create.
 */
type QuestionFormGroupInput = IQuestion | PartialWithRequiredKeyOf<NewQuestion>;

type QuestionFormDefaults = Pick<NewQuestion, 'id' | 'preLoaded' | 'students'>;

type QuestionFormGroupContent = {
  id: FormControl<IQuestion['id'] | NewQuestion['id']>;
  title: FormControl<IQuestion['title']>;
  difficulty: FormControl<IQuestion['difficulty']>;
  description: FormControl<IQuestion['description']>;
  solution: FormControl<IQuestion['solution']>;
  language: FormControl<IQuestion['language']>;
  preLoaded: FormControl<IQuestion['preLoaded']>;
  teacher: FormControl<IQuestion['teacher']>;
  studentClass: FormControl<IQuestion['studentClass']>;
  students: FormControl<IQuestion['students']>;
};

export type QuestionFormGroup = FormGroup<QuestionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class QuestionFormService {
  createQuestionFormGroup(question: QuestionFormGroupInput = { id: null }): QuestionFormGroup {
    const questionRawValue = {
      ...this.getFormDefaults(),
      ...question,
    };
    return new FormGroup<QuestionFormGroupContent>({
      id: new FormControl(
        { value: questionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(questionRawValue.title, {
        validators: [Validators.required],
      }),
      difficulty: new FormControl(questionRawValue.difficulty, {
        validators: [Validators.required],
      }),
      description: new FormControl(questionRawValue.description, {
        validators: [Validators.required],
      }),
      solution: new FormControl(questionRawValue.solution),
      language: new FormControl(questionRawValue.language, {
        validators: [Validators.required],
      }),
      preLoaded: new FormControl(questionRawValue.preLoaded, {
        validators: [Validators.required],
      }),
      teacher: new FormControl(questionRawValue.teacher),
      studentClass: new FormControl(questionRawValue.studentClass),
      students: new FormControl(questionRawValue.students ?? []),
    });
  }

  getQuestion(form: QuestionFormGroup): IQuestion | NewQuestion {
    return form.getRawValue() as IQuestion | NewQuestion;
  }

  resetForm(form: QuestionFormGroup, question: QuestionFormGroupInput): void {
    const questionRawValue = { ...this.getFormDefaults(), ...question };
    form.reset(
      {
        ...questionRawValue,
        id: { value: questionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): QuestionFormDefaults {
    return {
      id: null,
      preLoaded: false,
      students: [],
    };
  }
}
