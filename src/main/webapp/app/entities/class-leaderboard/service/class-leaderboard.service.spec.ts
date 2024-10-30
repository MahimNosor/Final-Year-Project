import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IClassLeaderboard } from '../class-leaderboard.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../class-leaderboard.test-samples';

import { ClassLeaderboardService } from './class-leaderboard.service';

const requireRestSample: IClassLeaderboard = {
  ...sampleWithRequiredData,
};

describe('ClassLeaderboard Service', () => {
  let service: ClassLeaderboardService;
  let httpMock: HttpTestingController;
  let expectedResult: IClassLeaderboard | IClassLeaderboard[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ClassLeaderboardService);
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

    it('should create a ClassLeaderboard', () => {
      const classLeaderboard = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(classLeaderboard).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ClassLeaderboard', () => {
      const classLeaderboard = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(classLeaderboard).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ClassLeaderboard', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ClassLeaderboard', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ClassLeaderboard', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a ClassLeaderboard', () => {
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

    describe('addClassLeaderboardToCollectionIfMissing', () => {
      it('should add a ClassLeaderboard to an empty array', () => {
        const classLeaderboard: IClassLeaderboard = sampleWithRequiredData;
        expectedResult = service.addClassLeaderboardToCollectionIfMissing([], classLeaderboard);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(classLeaderboard);
      });

      it('should not add a ClassLeaderboard to an array that contains it', () => {
        const classLeaderboard: IClassLeaderboard = sampleWithRequiredData;
        const classLeaderboardCollection: IClassLeaderboard[] = [
          {
            ...classLeaderboard,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addClassLeaderboardToCollectionIfMissing(classLeaderboardCollection, classLeaderboard);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ClassLeaderboard to an array that doesn't contain it", () => {
        const classLeaderboard: IClassLeaderboard = sampleWithRequiredData;
        const classLeaderboardCollection: IClassLeaderboard[] = [sampleWithPartialData];
        expectedResult = service.addClassLeaderboardToCollectionIfMissing(classLeaderboardCollection, classLeaderboard);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(classLeaderboard);
      });

      it('should add only unique ClassLeaderboard to an array', () => {
        const classLeaderboardArray: IClassLeaderboard[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const classLeaderboardCollection: IClassLeaderboard[] = [sampleWithRequiredData];
        expectedResult = service.addClassLeaderboardToCollectionIfMissing(classLeaderboardCollection, ...classLeaderboardArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const classLeaderboard: IClassLeaderboard = sampleWithRequiredData;
        const classLeaderboard2: IClassLeaderboard = sampleWithPartialData;
        expectedResult = service.addClassLeaderboardToCollectionIfMissing([], classLeaderboard, classLeaderboard2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(classLeaderboard);
        expect(expectedResult).toContain(classLeaderboard2);
      });

      it('should accept null and undefined values', () => {
        const classLeaderboard: IClassLeaderboard = sampleWithRequiredData;
        expectedResult = service.addClassLeaderboardToCollectionIfMissing([], null, classLeaderboard, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(classLeaderboard);
      });

      it('should return initial array if no ClassLeaderboard is added', () => {
        const classLeaderboardCollection: IClassLeaderboard[] = [sampleWithRequiredData];
        expectedResult = service.addClassLeaderboardToCollectionIfMissing(classLeaderboardCollection, undefined, null);
        expect(expectedResult).toEqual(classLeaderboardCollection);
      });
    });

    describe('compareClassLeaderboard', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareClassLeaderboard(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareClassLeaderboard(entity1, entity2);
        const compareResult2 = service.compareClassLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareClassLeaderboard(entity1, entity2);
        const compareResult2 = service.compareClassLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareClassLeaderboard(entity1, entity2);
        const compareResult2 = service.compareClassLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
