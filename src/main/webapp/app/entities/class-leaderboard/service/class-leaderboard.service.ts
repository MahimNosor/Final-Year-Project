import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IClassLeaderboard, NewClassLeaderboard } from '../class-leaderboard.model';

export type PartialUpdateClassLeaderboard = Partial<IClassLeaderboard> & Pick<IClassLeaderboard, 'id'>;

export type EntityResponseType = HttpResponse<IClassLeaderboard>;
export type EntityArrayResponseType = HttpResponse<IClassLeaderboard[]>;

@Injectable({ providedIn: 'root' })
export class ClassLeaderboardService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/class-leaderboards');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/class-leaderboards/_search');

  create(classLeaderboard: NewClassLeaderboard): Observable<EntityResponseType> {
    return this.http.post<IClassLeaderboard>(this.resourceUrl, classLeaderboard, { observe: 'response' });
  }

  update(classLeaderboard: IClassLeaderboard): Observable<EntityResponseType> {
    return this.http.put<IClassLeaderboard>(
      `${this.resourceUrl}/${this.getClassLeaderboardIdentifier(classLeaderboard)}`,
      classLeaderboard,
      { observe: 'response' },
    );
  }

  partialUpdate(classLeaderboard: PartialUpdateClassLeaderboard): Observable<EntityResponseType> {
    return this.http.patch<IClassLeaderboard>(
      `${this.resourceUrl}/${this.getClassLeaderboardIdentifier(classLeaderboard)}`,
      classLeaderboard,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IClassLeaderboard>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IClassLeaderboard[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IClassLeaderboard[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IClassLeaderboard[]>()], asapScheduler)));
  }

  getClassLeaderboardIdentifier(classLeaderboard: Pick<IClassLeaderboard, 'id'>): number {
    return classLeaderboard.id;
  }

  compareClassLeaderboard(o1: Pick<IClassLeaderboard, 'id'> | null, o2: Pick<IClassLeaderboard, 'id'> | null): boolean {
    return o1 && o2 ? this.getClassLeaderboardIdentifier(o1) === this.getClassLeaderboardIdentifier(o2) : o1 === o2;
  }

  addClassLeaderboardToCollectionIfMissing<Type extends Pick<IClassLeaderboard, 'id'>>(
    classLeaderboardCollection: Type[],
    ...classLeaderboardsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const classLeaderboards: Type[] = classLeaderboardsToCheck.filter(isPresent);
    if (classLeaderboards.length > 0) {
      const classLeaderboardCollectionIdentifiers = classLeaderboardCollection.map(classLeaderboardItem =>
        this.getClassLeaderboardIdentifier(classLeaderboardItem),
      );
      const classLeaderboardsToAdd = classLeaderboards.filter(classLeaderboardItem => {
        const classLeaderboardIdentifier = this.getClassLeaderboardIdentifier(classLeaderboardItem);
        if (classLeaderboardCollectionIdentifiers.includes(classLeaderboardIdentifier)) {
          return false;
        }
        classLeaderboardCollectionIdentifiers.push(classLeaderboardIdentifier);
        return true;
      });
      return [...classLeaderboardsToAdd, ...classLeaderboardCollection];
    }
    return classLeaderboardCollection;
  }
}
