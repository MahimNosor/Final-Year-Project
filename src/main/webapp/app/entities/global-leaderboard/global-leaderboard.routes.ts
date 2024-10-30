import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import GlobalLeaderboardResolve from './route/global-leaderboard-routing-resolve.service';

const globalLeaderboardRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/global-leaderboard.component').then(m => m.GlobalLeaderboardComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/global-leaderboard-detail.component').then(m => m.GlobalLeaderboardDetailComponent),
    resolve: {
      globalLeaderboard: GlobalLeaderboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/global-leaderboard-update.component').then(m => m.GlobalLeaderboardUpdateComponent),
    resolve: {
      globalLeaderboard: GlobalLeaderboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/global-leaderboard-update.component').then(m => m.GlobalLeaderboardUpdateComponent),
    resolve: {
      globalLeaderboard: GlobalLeaderboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default globalLeaderboardRoute;
