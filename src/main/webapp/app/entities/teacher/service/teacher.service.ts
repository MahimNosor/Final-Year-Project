import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { ITeacher, NewTeacher } from '../teacher.model';

export type PartialUpdateTeacher = Partial<ITeacher> & Pick<ITeacher, 'id'>;

export type EntityResponseType = HttpResponse<ITeacher>;
export type EntityArrayResponseType = HttpResponse<ITeacher[]>;

@Injectable({ providedIn: 'root' })
export class TeacherService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/teachers');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/teachers/_search');

  create(teacher: NewTeacher): Observable<EntityResponseType> {
    return this.http.post<ITeacher>(this.resourceUrl, teacher, { observe: 'response' });
  }

  update(teacher: ITeacher): Observable<EntityResponseType> {
    return this.http.put<ITeacher>(`${this.resourceUrl}/${this.getTeacherIdentifier(teacher)}`, teacher, { observe: 'response' });
  }

  partialUpdate(teacher: PartialUpdateTeacher): Observable<EntityResponseType> {
    return this.http.patch<ITeacher>(`${this.resourceUrl}/${this.getTeacherIdentifier(teacher)}`, teacher, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITeacher>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITeacher[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ITeacher[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<ITeacher[]>()], asapScheduler)));
  }

  getTeacherIdentifier(teacher: Pick<ITeacher, 'id'>): number {
    return teacher.id;
  }

  compareTeacher(o1: Pick<ITeacher, 'id'> | null, o2: Pick<ITeacher, 'id'> | null): boolean {
    return o1 && o2 ? this.getTeacherIdentifier(o1) === this.getTeacherIdentifier(o2) : o1 === o2;
  }

  addTeacherToCollectionIfMissing<Type extends Pick<ITeacher, 'id'>>(
    teacherCollection: Type[],
    ...teachersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const teachers: Type[] = teachersToCheck.filter(isPresent);
    if (teachers.length > 0) {
      const teacherCollectionIdentifiers = teacherCollection.map(teacherItem => this.getTeacherIdentifier(teacherItem));
      const teachersToAdd = teachers.filter(teacherItem => {
        const teacherIdentifier = this.getTeacherIdentifier(teacherItem);
        if (teacherCollectionIdentifiers.includes(teacherIdentifier)) {
          return false;
        }
        teacherCollectionIdentifiers.push(teacherIdentifier);
        return true;
      });
      return [...teachersToAdd, ...teacherCollection];
    }
    return teacherCollection;
  }
}
