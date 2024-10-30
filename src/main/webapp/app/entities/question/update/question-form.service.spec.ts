import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../question.test-samples';

import { QuestionFormService } from './question-form.service';

describe('Question Form Service', () => {
  let service: QuestionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionFormService);
  });

  describe('Service methods', () => {
    describe('createQuestionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createQuestionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            difficulty: expect.any(Object),
            description: expect.any(Object),
            solution: expect.any(Object),
            language: expect.any(Object),
            preLoaded: expect.any(Object),
            teacher: expect.any(Object),
            studentClass: expect.any(Object),
            students: expect.any(Object),
          }),
        );
      });

      it('passing IQuestion should create a new form with FormGroup', () => {
        const formGroup = service.createQuestionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            difficulty: expect.any(Object),
            description: expect.any(Object),
            solution: expect.any(Object),
            language: expect.any(Object),
            preLoaded: expect.any(Object),
            teacher: expect.any(Object),
            studentClass: expect.any(Object),
            students: expect.any(Object),
          }),
        );
      });
    });

    describe('getQuestion', () => {
      it('should return NewQuestion for default Question initial value', () => {
        const formGroup = service.createQuestionFormGroup(sampleWithNewData);

        const question = service.getQuestion(formGroup) as any;

        expect(question).toMatchObject(sampleWithNewData);
      });

      it('should return NewQuestion for empty Question initial value', () => {
        const formGroup = service.createQuestionFormGroup();

        const question = service.getQuestion(formGroup) as any;

        expect(question).toMatchObject({});
      });

      it('should return IQuestion', () => {
        const formGroup = service.createQuestionFormGroup(sampleWithRequiredData);

        const question = service.getQuestion(formGroup) as any;

        expect(question).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IQuestion should not enable id FormControl', () => {
        const formGroup = service.createQuestionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewQuestion should disable id FormControl', () => {
        const formGroup = service.createQuestionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
