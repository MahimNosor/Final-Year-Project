import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITeacher } from '../teacher.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../teacher.test-samples';

import { TeacherService } from './teacher.service';

const requireRestSample: ITeacher = {
  ...sampleWithRequiredData,
};

describe('Teacher Service', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;
  let expectedResult: ITeacher | ITeacher[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TeacherService);
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

    it('should create a Teacher', () => {
      const teacher = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(teacher).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Teacher', () => {
      const teacher = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(teacher).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Teacher', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Teacher', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Teacher', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Teacher', () => {
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

    describe('addTeacherToCollectionIfMissing', () => {
      it('should add a Teacher to an empty array', () => {
        const teacher: ITeacher = sampleWithRequiredData;
        expectedResult = service.addTeacherToCollectionIfMissing([], teacher);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(teacher);
      });

      it('should not add a Teacher to an array that contains it', () => {
        const teacher: ITeacher = sampleWithRequiredData;
        const teacherCollection: ITeacher[] = [
          {
            ...teacher,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTeacherToCollectionIfMissing(teacherCollection, teacher);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Teacher to an array that doesn't contain it", () => {
        const teacher: ITeacher = sampleWithRequiredData;
        const teacherCollection: ITeacher[] = [sampleWithPartialData];
        expectedResult = service.addTeacherToCollectionIfMissing(teacherCollection, teacher);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(teacher);
      });

      it('should add only unique Teacher to an array', () => {
        const teacherArray: ITeacher[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const teacherCollection: ITeacher[] = [sampleWithRequiredData];
        expectedResult = service.addTeacherToCollectionIfMissing(teacherCollection, ...teacherArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const teacher: ITeacher = sampleWithRequiredData;
        const teacher2: ITeacher = sampleWithPartialData;
        expectedResult = service.addTeacherToCollectionIfMissing([], teacher, teacher2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(teacher);
        expect(expectedResult).toContain(teacher2);
      });

      it('should accept null and undefined values', () => {
        const teacher: ITeacher = sampleWithRequiredData;
        expectedResult = service.addTeacherToCollectionIfMissing([], null, teacher, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(teacher);
      });

      it('should return initial array if no Teacher is added', () => {
        const teacherCollection: ITeacher[] = [sampleWithRequiredData];
        expectedResult = service.addTeacherToCollectionIfMissing(teacherCollection, undefined, null);
        expect(expectedResult).toEqual(teacherCollection);
      });
    });

    describe('compareTeacher', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTeacher(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareTeacher(entity1, entity2);
        const compareResult2 = service.compareTeacher(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareTeacher(entity1, entity2);
        const compareResult2 = service.compareTeacher(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareTeacher(entity1, entity2);
        const compareResult2 = service.compareTeacher(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
