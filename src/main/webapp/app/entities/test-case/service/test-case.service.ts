import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { SearchWithPagination } from 'app/core/request/request.model';
import { ITestCase, NewTestCase } from '../test-case.model';

export type PartialUpdateTestCase = Partial<ITestCase> & Pick<ITestCase, 'id'>;

export type EntityResponseType = HttpResponse<ITestCase>;
export type EntityArrayResponseType = HttpResponse<ITestCase[]>;

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/test-cases');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/test-cases/_search');

  create(testCase: NewTestCase): Observable<EntityResponseType> {
    return this.http.post<ITestCase>(this.resourceUrl, testCase, { observe: 'response' });
  }

  update(testCase: ITestCase): Observable<EntityResponseType> {
    return this.http.put<ITestCase>(`${this.resourceUrl}/${this.getTestCaseIdentifier(testCase)}`, testCase, { observe: 'response' });
  }

  partialUpdate(testCase: PartialUpdateTestCase): Observable<EntityResponseType> {
    return this.http.patch<ITestCase>(`${this.resourceUrl}/${this.getTestCaseIdentifier(testCase)}`, testCase, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITestCase>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITestCase[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ITestCase[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<ITestCase[]>()], asapScheduler)));
  }

  getTestCaseIdentifier(testCase: Pick<ITestCase, 'id'>): number {
    return testCase.id;
  }

  compareTestCase(o1: Pick<ITestCase, 'id'> | null, o2: Pick<ITestCase, 'id'> | null): boolean {
    return o1 && o2 ? this.getTestCaseIdentifier(o1) === this.getTestCaseIdentifier(o2) : o1 === o2;
  }

  addTestCaseToCollectionIfMissing<Type extends Pick<ITestCase, 'id'>>(
    testCaseCollection: Type[],
    ...testCasesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const testCases: Type[] = testCasesToCheck.filter(isPresent);
    if (testCases.length > 0) {
      const testCaseCollectionIdentifiers = testCaseCollection.map(testCaseItem => this.getTestCaseIdentifier(testCaseItem));
      const testCasesToAdd = testCases.filter(testCaseItem => {
        const testCaseIdentifier = this.getTestCaseIdentifier(testCaseItem);
        if (testCaseCollectionIdentifiers.includes(testCaseIdentifier)) {
          return false;
        }
        testCaseCollectionIdentifiers.push(testCaseIdentifier);
        return true;
      });
      return [...testCasesToAdd, ...testCaseCollection];
    }
    return testCaseCollection;
  }
}
