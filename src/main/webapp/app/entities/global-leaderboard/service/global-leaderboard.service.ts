import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IGlobalLeaderboard, NewGlobalLeaderboard } from '../global-leaderboard.model';

export type PartialUpdateGlobalLeaderboard = Partial<IGlobalLeaderboard> & Pick<IGlobalLeaderboard, 'id'>;

export type EntityResponseType = HttpResponse<IGlobalLeaderboard>;
export type EntityArrayResponseType = HttpResponse<IGlobalLeaderboard[]>;

@Injectable({ providedIn: 'root' })
export class GlobalLeaderboardService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/global-leaderboards');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/global-leaderboards/_search');

  create(globalLeaderboard: NewGlobalLeaderboard): Observable<EntityResponseType> {
    return this.http.post<IGlobalLeaderboard>(this.resourceUrl, globalLeaderboard, { observe: 'response' });
  }

  update(globalLeaderboard: IGlobalLeaderboard): Observable<EntityResponseType> {
    return this.http.put<IGlobalLeaderboard>(
      `${this.resourceUrl}/${this.getGlobalLeaderboardIdentifier(globalLeaderboard)}`,
      globalLeaderboard,
      { observe: 'response' },
    );
  }

  partialUpdate(globalLeaderboard: PartialUpdateGlobalLeaderboard): Observable<EntityResponseType> {
    return this.http.patch<IGlobalLeaderboard>(
      `${this.resourceUrl}/${this.getGlobalLeaderboardIdentifier(globalLeaderboard)}`,
      globalLeaderboard,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IGlobalLeaderboard>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IGlobalLeaderboard[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IGlobalLeaderboard[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IGlobalLeaderboard[]>()], asapScheduler)));
  }

  getGlobalLeaderboardIdentifier(globalLeaderboard: Pick<IGlobalLeaderboard, 'id'>): number {
    return globalLeaderboard.id;
  }

  compareGlobalLeaderboard(o1: Pick<IGlobalLeaderboard, 'id'> | null, o2: Pick<IGlobalLeaderboard, 'id'> | null): boolean {
    return o1 && o2 ? this.getGlobalLeaderboardIdentifier(o1) === this.getGlobalLeaderboardIdentifier(o2) : o1 === o2;
  }

  addGlobalLeaderboardToCollectionIfMissing<Type extends Pick<IGlobalLeaderboard, 'id'>>(
    globalLeaderboardCollection: Type[],
    ...globalLeaderboardsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const globalLeaderboards: Type[] = globalLeaderboardsToCheck.filter(isPresent);
    if (globalLeaderboards.length > 0) {
      const globalLeaderboardCollectionIdentifiers = globalLeaderboardCollection.map(globalLeaderboardItem =>
        this.getGlobalLeaderboardIdentifier(globalLeaderboardItem),
      );
      const globalLeaderboardsToAdd = globalLeaderboards.filter(globalLeaderboardItem => {
        const globalLeaderboardIdentifier = this.getGlobalLeaderboardIdentifier(globalLeaderboardItem);
        if (globalLeaderboardCollectionIdentifiers.includes(globalLeaderboardIdentifier)) {
          return false;
        }
        globalLeaderboardCollectionIdentifiers.push(globalLeaderboardIdentifier);
        return true;
      });
      return [...globalLeaderboardsToAdd, ...globalLeaderboardCollection];
    }
    return globalLeaderboardCollection;
  }
}
