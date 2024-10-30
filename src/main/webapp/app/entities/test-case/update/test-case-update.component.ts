import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IQuestion } from 'app/entities/question/question.model';
import { QuestionService } from 'app/entities/question/service/question.service';
import { ITestCase } from '../test-case.model';
import { TestCaseService } from '../service/test-case.service';
import { TestCaseFormGroup, TestCaseFormService } from './test-case-form.service';

@Component({
  standalone: true,
  selector: 'jhi-test-case-update',
  templateUrl: './test-case-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TestCaseUpdateComponent implements OnInit {
  isSaving = false;
  testCase: ITestCase | null = null;

  questionsSharedCollection: IQuestion[] = [];

  protected testCaseService = inject(TestCaseService);
  protected testCaseFormService = inject(TestCaseFormService);
  protected questionService = inject(QuestionService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TestCaseFormGroup = this.testCaseFormService.createTestCaseFormGroup();

  compareQuestion = (o1: IQuestion | null, o2: IQuestion | null): boolean => this.questionService.compareQuestion(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ testCase }) => {
      this.testCase = testCase;
      if (testCase) {
        this.updateForm(testCase);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const testCase = this.testCaseFormService.getTestCase(this.editForm);
    if (testCase.id !== null) {
      this.subscribeToSaveResponse(this.testCaseService.update(testCase));
    } else {
      this.subscribeToSaveResponse(this.testCaseService.create(testCase));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITestCase>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(testCase: ITestCase): void {
    this.testCase = testCase;
    this.testCaseFormService.resetForm(this.editForm, testCase);

    this.questionsSharedCollection = this.questionService.addQuestionToCollectionIfMissing<IQuestion>(
      this.questionsSharedCollection,
      testCase.question,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.questionService
      .query()
      .pipe(map((res: HttpResponse<IQuestion[]>) => res.body ?? []))
      .pipe(
        map((questions: IQuestion[]) =>
          this.questionService.addQuestionToCollectionIfMissing<IQuestion>(questions, this.testCase?.question),
        ),
      )
      .subscribe((questions: IQuestion[]) => (this.questionsSharedCollection = questions));
  }
}
