import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../class-leaderboard.test-samples';

import { ClassLeaderboardFormService } from './class-leaderboard-form.service';

describe('ClassLeaderboard Form Service', () => {
  let service: ClassLeaderboardFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassLeaderboardFormService);
  });

  describe('Service methods', () => {
    describe('createClassLeaderboardFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createClassLeaderboardFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            rank: expect.any(Object),
            totalPoints: expect.any(Object),
            student: expect.any(Object),
            studentClass: expect.any(Object),
          }),
        );
      });

      it('passing IClassLeaderboard should create a new form with FormGroup', () => {
        const formGroup = service.createClassLeaderboardFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            rank: expect.any(Object),
            totalPoints: expect.any(Object),
            student: expect.any(Object),
            studentClass: expect.any(Object),
          }),
        );
      });
    });

    describe('getClassLeaderboard', () => {
      it('should return NewClassLeaderboard for default ClassLeaderboard initial value', () => {
        const formGroup = service.createClassLeaderboardFormGroup(sampleWithNewData);

        const classLeaderboard = service.getClassLeaderboard(formGroup) as any;

        expect(classLeaderboard).toMatchObject(sampleWithNewData);
      });

      it('should return NewClassLeaderboard for empty ClassLeaderboard initial value', () => {
        const formGroup = service.createClassLeaderboardFormGroup();

        const classLeaderboard = service.getClassLeaderboard(formGroup) as any;

        expect(classLeaderboard).toMatchObject({});
      });

      it('should return IClassLeaderboard', () => {
        const formGroup = service.createClassLeaderboardFormGroup(sampleWithRequiredData);

        const classLeaderboard = service.getClassLeaderboard(formGroup) as any;

        expect(classLeaderboard).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IClassLeaderboard should not enable id FormControl', () => {
        const formGroup = service.createClassLeaderboardFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewClassLeaderboard should disable id FormControl', () => {
        const formGroup = service.createClassLeaderboardFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
