import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('Question e2e test', () => {
  const questionPageUrl = '/question';
  const questionPageUrlPattern = new RegExp('/question(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const questionSample = {
    title: 'gee a',
    difficulty: 'BEGINNER',
    description: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
    language: 'C',
    preLoaded: false,
  };

  let question;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/questions+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/questions').as('postEntityRequest');
    cy.intercept('DELETE', '/api/questions/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (question) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/questions/${question.id}`,
      }).then(() => {
        question = undefined;
      });
    }
  });

  it('Questions menu should load Questions page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('question');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Question').should('exist');
    cy.url().should('match', questionPageUrlPattern);
  });

  describe('Question page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(questionPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Question page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/question/new$'));
        cy.getEntityCreateUpdateHeading('Question');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', questionPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/questions',
          body: questionSample,
        }).then(({ body }) => {
          question = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/questions+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/questions?page=0&size=20>; rel="last",<http://localhost/api/questions?page=0&size=20>; rel="first"',
              },
              body: [question],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(questionPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Question page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('question');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', questionPageUrlPattern);
      });

      it('edit button click should load edit Question page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Question');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', questionPageUrlPattern);
      });

      it('edit button click should load edit Question page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Question');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', questionPageUrlPattern);
      });

      it('last delete button click should delete instance of Question', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('question').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', questionPageUrlPattern);

        question = undefined;
      });
    });
  });

  describe('new Question page', () => {
    beforeEach(() => {
      cy.visit(`${questionPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Question');
    });

    it('should create an instance of Question', () => {
      cy.get(`[data-cy="title"]`).type('lively');
      cy.get(`[data-cy="title"]`).should('have.value', 'lively');

      cy.get(`[data-cy="difficulty"]`).select('BEGINNER');

      cy.get(`[data-cy="description"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="description"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="solution"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="solution"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="language"]`).select('JAVASCRIPT');

      cy.get(`[data-cy="preLoaded"]`).should('not.be.checked');
      cy.get(`[data-cy="preLoaded"]`).click();
      cy.get(`[data-cy="preLoaded"]`).should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        question = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', questionPageUrlPattern);
    });
  });
});
