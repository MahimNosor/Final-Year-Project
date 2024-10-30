import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'finalYearProjectApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'student',
    data: { pageTitle: 'finalYearProjectApp.student.home.title' },
    loadChildren: () => import('./student/student.routes'),
  },
  {
    path: 'teacher',
    data: { pageTitle: 'finalYearProjectApp.teacher.home.title' },
    loadChildren: () => import('./teacher/teacher.routes'),
  },
  {
    path: 'question',
    data: { pageTitle: 'finalYearProjectApp.question.home.title' },
    loadChildren: () => import('./question/question.routes'),
  },
  {
    path: 'test-case',
    data: { pageTitle: 'finalYearProjectApp.testCase.home.title' },
    loadChildren: () => import('./test-case/test-case.routes'),
  },
  {
    path: 'student-class',
    data: { pageTitle: 'finalYearProjectApp.studentClass.home.title' },
    loadChildren: () => import('./student-class/student-class.routes'),
  },
  {
    path: 'global-leaderboard',
    data: { pageTitle: 'finalYearProjectApp.globalLeaderboard.home.title' },
    loadChildren: () => import('./global-leaderboard/global-leaderboard.routes'),
  },
  {
    path: 'class-leaderboard',
    data: { pageTitle: 'finalYearProjectApp.classLeaderboard.home.title' },
    loadChildren: () => import('./class-leaderboard/class-leaderboard.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
