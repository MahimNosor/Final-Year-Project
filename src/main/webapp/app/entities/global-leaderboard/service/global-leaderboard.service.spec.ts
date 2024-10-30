import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IGlobalLeaderboard } from '../global-leaderboard.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../global-leaderboard.test-samples';

import { GlobalLeaderboardService } from './global-leaderboard.service';

const requireRestSample: IGlobalLeaderboard = {
  ...sampleWithRequiredData,
};

describe('GlobalLeaderboard Service', () => {
  let service: GlobalLeaderboardService;
  let httpMock: HttpTestingController;
  let expectedResult: IGlobalLeaderboard | IGlobalLeaderboard[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(GlobalLeaderboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a GlobalLeaderboard', () => {
      const globalLeaderboard = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(globalLeaderboard).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a GlobalLeaderboard', () => {
      const globalLeaderboard = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(globalLeaderboard).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a GlobalLeaderboard', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of GlobalLeaderboard', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a GlobalLeaderboard', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a GlobalLeaderboard', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addGlobalLeaderboardToCollectionIfMissing', () => {
      it('should add a GlobalLeaderboard to an empty array', () => {
        const globalLeaderboard: IGlobalLeaderboard = sampleWithRequiredData;
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing([], globalLeaderboard);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(globalLeaderboard);
      });

      it('should not add a GlobalLeaderboard to an array that contains it', () => {
        const globalLeaderboard: IGlobalLeaderboard = sampleWithRequiredData;
        const globalLeaderboardCollection: IGlobalLeaderboard[] = [
          {
            ...globalLeaderboard,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing(globalLeaderboardCollection, globalLeaderboard);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a GlobalLeaderboard to an array that doesn't contain it", () => {
        const globalLeaderboard: IGlobalLeaderboard = sampleWithRequiredData;
        const globalLeaderboardCollection: IGlobalLeaderboard[] = [sampleWithPartialData];
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing(globalLeaderboardCollection, globalLeaderboard);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(globalLeaderboard);
      });

      it('should add only unique GlobalLeaderboard to an array', () => {
        const globalLeaderboardArray: IGlobalLeaderboard[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const globalLeaderboardCollection: IGlobalLeaderboard[] = [sampleWithRequiredData];
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing(globalLeaderboardCollection, ...globalLeaderboardArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const globalLeaderboard: IGlobalLeaderboard = sampleWithRequiredData;
        const globalLeaderboard2: IGlobalLeaderboard = sampleWithPartialData;
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing([], globalLeaderboard, globalLeaderboard2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(globalLeaderboard);
        expect(expectedResult).toContain(globalLeaderboard2);
      });

      it('should accept null and undefined values', () => {
        const globalLeaderboard: IGlobalLeaderboard = sampleWithRequiredData;
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing([], null, globalLeaderboard, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(globalLeaderboard);
      });

      it('should return initial array if no GlobalLeaderboard is added', () => {
        const globalLeaderboardCollection: IGlobalLeaderboard[] = [sampleWithRequiredData];
        expectedResult = service.addGlobalLeaderboardToCollectionIfMissing(globalLeaderboardCollection, undefined, null);
        expect(expectedResult).toEqual(globalLeaderboardCollection);
      });
    });

    describe('compareGlobalLeaderboard', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareGlobalLeaderboard(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareGlobalLeaderboard(entity1, entity2);
        const compareResult2 = service.compareGlobalLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareGlobalLeaderboard(entity1, entity2);
        const compareResult2 = service.compareGlobalLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareGlobalLeaderboard(entity1, entity2);
        const compareResult2 = service.compareGlobalLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
