import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { SearchWithPagination } from 'app/core/request/request.model';
import { IStudent, NewStudent } from '../student.model';

export type PartialUpdateStudent = Partial<IStudent> & Pick<IStudent, 'id'>;

export type EntityResponseType = HttpResponse<IStudent>;
export type EntityArrayResponseType = HttpResponse<IStudent[]>;

@Injectable({ providedIn: 'root' })
export class StudentService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/students');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/students/_search');

  create(student: NewStudent): Observable<EntityResponseType> {
    return this.http.post<IStudent>(this.resourceUrl, student, { observe: 'response' });
  }

  update(student: IStudent): Observable<EntityResponseType> {
    return this.http.put<IStudent>(`${this.resourceUrl}/${this.getStudentIdentifier(student)}`, student, { observe: 'response' });
  }

  partialUpdate(student: PartialUpdateStudent): Observable<EntityResponseType> {
    return this.http.patch<IStudent>(`${this.resourceUrl}/${this.getStudentIdentifier(student)}`, student, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IStudent>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IStudent[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IStudent[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IStudent[]>()], asapScheduler)));
  }

  getStudentIdentifier(student: Pick<IStudent, 'id'>): number {
    return student.id;
  }

  compareStudent(o1: Pick<IStudent, 'id'> | null, o2: Pick<IStudent, 'id'> | null): boolean {
    return o1 && o2 ? this.getStudentIdentifier(o1) === this.getStudentIdentifier(o2) : o1 === o2;
  }

  addStudentToCollectionIfMissing<Type extends Pick<IStudent, 'id'>>(
    studentCollection: Type[],
    ...studentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const students: Type[] = studentsToCheck.filter(isPresent);
    if (students.length > 0) {
      const studentCollectionIdentifiers = studentCollection.map(studentItem => this.getStudentIdentifier(studentItem));
      const studentsToAdd = students.filter(studentItem => {
        const studentIdentifier = this.getStudentIdentifier(studentItem);
        if (studentCollectionIdentifiers.includes(studentIdentifier)) {
          return false;
        }
        studentCollectionIdentifiers.push(studentIdentifier);
        return true;
      });
      return [...studentsToAdd, ...studentCollection];
    }
    return studentCollection;
  }
}
