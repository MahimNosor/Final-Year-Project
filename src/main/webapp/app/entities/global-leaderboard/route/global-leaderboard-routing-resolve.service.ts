import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IGlobalLeaderboard } from '../global-leaderboard.model';
import { GlobalLeaderboardService } from '../service/global-leaderboard.service';

const globalLeaderboardResolve = (route: ActivatedRouteSnapshot): Observable<null | IGlobalLeaderboard> => {
  const id = route.params.id;
  if (id) {
    return inject(GlobalLeaderboardService)
      .find(id)
      .pipe(
        mergeMap((globalLeaderboard: HttpResponse<IGlobalLeaderboard>) => {
          if (globalLeaderboard.body) {
            return of(globalLeaderboard.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default globalLeaderboardResolve;
