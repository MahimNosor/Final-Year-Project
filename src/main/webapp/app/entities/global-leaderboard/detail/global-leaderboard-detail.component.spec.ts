import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { GlobalLeaderboardDetailComponent } from './global-leaderboard-detail.component';

describe('GlobalLeaderboard Management Detail Component', () => {
  let comp: GlobalLeaderboardDetailComponent;
  let fixture: ComponentFixture<GlobalLeaderboardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLeaderboardDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./global-leaderboard-detail.component').then(m => m.GlobalLeaderboardDetailComponent),
              resolve: { globalLeaderboard: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(GlobalLeaderboardDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalLeaderboardDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load globalLeaderboard on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', GlobalLeaderboardDetailComponent);

      // THEN
      expect(instance.globalLeaderboard()).toEqual(expect.objectContaining({ id: 123 }));
    });
  });

  describe('PreviousState', () => {
    it('Should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
