import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../global-leaderboard.test-samples';

import { GlobalLeaderboardFormService } from './global-leaderboard-form.service';

describe('GlobalLeaderboard Form Service', () => {
  let service: GlobalLeaderboardFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalLeaderboardFormService);
  });

  describe('Service methods', () => {
    describe('createGlobalLeaderboardFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            rank: expect.any(Object),
            totalPoints: expect.any(Object),
            student: expect.any(Object),
          }),
        );
      });

      it('passing IGlobalLeaderboard should create a new form with FormGroup', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            rank: expect.any(Object),
            totalPoints: expect.any(Object),
            student: expect.any(Object),
          }),
        );
      });
    });

    describe('getGlobalLeaderboard', () => {
      it('should return NewGlobalLeaderboard for default GlobalLeaderboard initial value', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup(sampleWithNewData);

        const globalLeaderboard = service.getGlobalLeaderboard(formGroup) as any;

        expect(globalLeaderboard).toMatchObject(sampleWithNewData);
      });

      it('should return NewGlobalLeaderboard for empty GlobalLeaderboard initial value', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup();

        const globalLeaderboard = service.getGlobalLeaderboard(formGroup) as any;

        expect(globalLeaderboard).toMatchObject({});
      });

      it('should return IGlobalLeaderboard', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup(sampleWithRequiredData);

        const globalLeaderboard = service.getGlobalLeaderboard(formGroup) as any;

        expect(globalLeaderboard).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IGlobalLeaderboard should not enable id FormControl', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewGlobalLeaderboard should disable id FormControl', () => {
        const formGroup = service.createGlobalLeaderboardFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
