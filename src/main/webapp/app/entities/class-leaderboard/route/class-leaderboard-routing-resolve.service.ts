import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IClassLeaderboard } from '../class-leaderboard.model';
import { ClassLeaderboardService } from '../service/class-leaderboard.service';

const classLeaderboardResolve = (route: ActivatedRouteSnapshot): Observable<null | IClassLeaderboard> => {
  const id = route.params.id;
  if (id) {
    return inject(ClassLeaderboardService)
      .find(id)
      .pipe(
        mergeMap((classLeaderboard: HttpResponse<IClassLeaderboard>) => {
          if (classLeaderboard.body) {
            return of(classLeaderboard.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default classLeaderboardResolve;
