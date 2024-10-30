import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IQuestion } from 'app/entities/question/question.model';
import { QuestionService } from 'app/entities/question/service/question.service';
import { TestCaseService } from '../service/test-case.service';
import { ITestCase } from '../test-case.model';
import { TestCaseFormService } from './test-case-form.service';

import { TestCaseUpdateComponent } from './test-case-update.component';

describe('TestCase Management Update Component', () => {
  let comp: TestCaseUpdateComponent;
  let fixture: ComponentFixture<TestCaseUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let testCaseFormService: TestCaseFormService;
  let testCaseService: TestCaseService;
  let questionService: QuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCaseUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TestCaseUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TestCaseUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    testCaseFormService = TestBed.inject(TestCaseFormService);
    testCaseService = TestBed.inject(TestCaseService);
    questionService = TestBed.inject(QuestionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Question query and add missing value', () => {
      const testCase: ITestCase = { id: 456 };
      const question: IQuestion = { id: 6506 };
      testCase.question = question;

      const questionCollection: IQuestion[] = [{ id: 23621 }];
      jest.spyOn(questionService, 'query').mockReturnValue(of(new HttpResponse({ body: questionCollection })));
      const additionalQuestions = [question];
      const expectedCollection: IQuestion[] = [...additionalQuestions, ...questionCollection];
      jest.spyOn(questionService, 'addQuestionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ testCase });
      comp.ngOnInit();

      expect(questionService.query).toHaveBeenCalled();
      expect(questionService.addQuestionToCollectionIfMissing).toHaveBeenCalledWith(
        questionCollection,
        ...additionalQuestions.map(expect.objectContaining),
      );
      expect(comp.questionsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const testCase: ITestCase = { id: 456 };
      const question: IQuestion = { id: 9414 };
      testCase.question = question;

      activatedRoute.data = of({ testCase });
      comp.ngOnInit();

      expect(comp.questionsSharedCollection).toContain(question);
      expect(comp.testCase).toEqual(testCase);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestCase>>();
      const testCase = { id: 123 };
      jest.spyOn(testCaseFormService, 'getTestCase').mockReturnValue(testCase);
      jest.spyOn(testCaseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testCase });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: testCase }));
      saveSubject.complete();

      // THEN
      expect(testCaseFormService.getTestCase).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(testCaseService.update).toHaveBeenCalledWith(expect.objectContaining(testCase));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestCase>>();
      const testCase = { id: 123 };
      jest.spyOn(testCaseFormService, 'getTestCase').mockReturnValue({ id: null });
      jest.spyOn(testCaseService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testCase: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: testCase }));
      saveSubject.complete();

      // THEN
      expect(testCaseFormService.getTestCase).toHaveBeenCalled();
      expect(testCaseService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestCase>>();
      const testCase = { id: 123 };
      jest.spyOn(testCaseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testCase });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(testCaseService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareQuestion', () => {
      it('Should forward to questionService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(questionService, 'compareQuestion');
        comp.compareQuestion(entity, entity2);
        expect(questionService.compareQuestion).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
