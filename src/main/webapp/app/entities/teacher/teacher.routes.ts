import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TeacherResolve from './route/teacher-routing-resolve.service';

const teacherRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/teacher.component').then(m => m.TeacherComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/teacher-detail.component').then(m => m.TeacherDetailComponent),
    resolve: {
      teacher: TeacherResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/teacher-update.component').then(m => m.TeacherUpdateComponent),
    resolve: {
      teacher: TeacherResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/teacher-update.component').then(m => m.TeacherUpdateComponent),
    resolve: {
      teacher: TeacherResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default teacherRoute;
