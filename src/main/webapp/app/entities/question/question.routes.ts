import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import QuestionResolve from './route/question-routing-resolve.service';

const questionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/question.component').then(m => m.QuestionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/question-detail.component').then(m => m.QuestionDetailComponent),
    resolve: {
      question: QuestionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/question-update.component').then(m => m.QuestionUpdateComponent),
    resolve: {
      question: QuestionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/question-update.component').then(m => m.QuestionUpdateComponent),
    resolve: {
      question: QuestionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default questionRoute;
