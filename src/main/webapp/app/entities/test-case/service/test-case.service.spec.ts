import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITestCase } from '../test-case.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../test-case.test-samples';

import { TestCaseService } from './test-case.service';

const requireRestSample: ITestCase = {
  ...sampleWithRequiredData,
};

describe('TestCase Service', () => {
  let service: TestCaseService;
  let httpMock: HttpTestingController;
  let expectedResult: ITestCase | ITestCase[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TestCaseService);
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

    it('should create a TestCase', () => {
      const testCase = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(testCase).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TestCase', () => {
      const testCase = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(testCase).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TestCase', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TestCase', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TestCase', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a TestCase', () => {
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

    describe('addTestCaseToCollectionIfMissing', () => {
      it('should add a TestCase to an empty array', () => {
        const testCase: ITestCase = sampleWithRequiredData;
        expectedResult = service.addTestCaseToCollectionIfMissing([], testCase);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(testCase);
      });

      it('should not add a TestCase to an array that contains it', () => {
        const testCase: ITestCase = sampleWithRequiredData;
        const testCaseCollection: ITestCase[] = [
          {
            ...testCase,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTestCaseToCollectionIfMissing(testCaseCollection, testCase);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TestCase to an array that doesn't contain it", () => {
        const testCase: ITestCase = sampleWithRequiredData;
        const testCaseCollection: ITestCase[] = [sampleWithPartialData];
        expectedResult = service.addTestCaseToCollectionIfMissing(testCaseCollection, testCase);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(testCase);
      });

      it('should add only unique TestCase to an array', () => {
        const testCaseArray: ITestCase[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const testCaseCollection: ITestCase[] = [sampleWithRequiredData];
        expectedResult = service.addTestCaseToCollectionIfMissing(testCaseCollection, ...testCaseArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const testCase: ITestCase = sampleWithRequiredData;
        const testCase2: ITestCase = sampleWithPartialData;
        expectedResult = service.addTestCaseToCollectionIfMissing([], testCase, testCase2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(testCase);
        expect(expectedResult).toContain(testCase2);
      });

      it('should accept null and undefined values', () => {
        const testCase: ITestCase = sampleWithRequiredData;
        expectedResult = service.addTestCaseToCollectionIfMissing([], null, testCase, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(testCase);
      });

      it('should return initial array if no TestCase is added', () => {
        const testCaseCollection: ITestCase[] = [sampleWithRequiredData];
        expectedResult = service.addTestCaseToCollectionIfMissing(testCaseCollection, undefined, null);
        expect(expectedResult).toEqual(testCaseCollection);
      });
    });

    describe('compareTestCase', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTestCase(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareTestCase(entity1, entity2);
        const compareResult2 = service.compareTestCase(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareTestCase(entity1, entity2);
        const compareResult2 = service.compareTestCase(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareTestCase(entity1, entity2);
        const compareResult2 = service.compareTestCase(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
