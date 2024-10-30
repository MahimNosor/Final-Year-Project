import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITestCase } from '../test-case.model';
import { TestCaseService } from '../service/test-case.service';

const testCaseResolve = (route: ActivatedRouteSnapshot): Observable<null | ITestCase> => {
  const id = route.params.id;
  if (id) {
    return inject(TestCaseService)
      .find(id)
      .pipe(
        mergeMap((testCase: HttpResponse<ITestCase>) => {
          if (testCase.body) {
            return of(testCase.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default testCaseResolve;
