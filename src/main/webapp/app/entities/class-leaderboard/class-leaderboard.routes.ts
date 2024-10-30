import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ClassLeaderboardResolve from './route/class-leaderboard-routing-resolve.service';

const classLeaderboardRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/class-leaderboard.component').then(m => m.ClassLeaderboardComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/class-leaderboard-detail.component').then(m => m.ClassLeaderboardDetailComponent),
    resolve: {
      classLeaderboard: ClassLeaderboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/class-leaderboard-update.component').then(m => m.ClassLeaderboardUpdateComponent),
    resolve: {
      classLeaderboard: ClassLeaderboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/class-leaderboard-update.component').then(m => m.ClassLeaderboardUpdateComponent),
    resolve: {
      classLeaderboard: ClassLeaderboardResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default classLeaderboardRoute;
