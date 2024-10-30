import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../test-case.test-samples';

import { TestCaseFormService } from './test-case-form.service';

describe('TestCase Form Service', () => {
  let service: TestCaseFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestCaseFormService);
  });

  describe('Service methods', () => {
    describe('createTestCaseFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTestCaseFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            input: expect.any(Object),
            expectedOutput: expect.any(Object),
            description: expect.any(Object),
            question: expect.any(Object),
          }),
        );
      });

      it('passing ITestCase should create a new form with FormGroup', () => {
        const formGroup = service.createTestCaseFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            input: expect.any(Object),
            expectedOutput: expect.any(Object),
            description: expect.any(Object),
            question: expect.any(Object),
          }),
        );
      });
    });

    describe('getTestCase', () => {
      it('should return NewTestCase for default TestCase initial value', () => {
        const formGroup = service.createTestCaseFormGroup(sampleWithNewData);

        const testCase = service.getTestCase(formGroup) as any;

        expect(testCase).toMatchObject(sampleWithNewData);
      });

      it('should return NewTestCase for empty TestCase initial value', () => {
        const formGroup = service.createTestCaseFormGroup();

        const testCase = service.getTestCase(formGroup) as any;

        expect(testCase).toMatchObject({});
      });

      it('should return ITestCase', () => {
        const formGroup = service.createTestCaseFormGroup(sampleWithRequiredData);

        const testCase = service.getTestCase(formGroup) as any;

        expect(testCase).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITestCase should not enable id FormControl', () => {
        const formGroup = service.createTestCaseFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTestCase should disable id FormControl', () => {
        const formGroup = service.createTestCaseFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
