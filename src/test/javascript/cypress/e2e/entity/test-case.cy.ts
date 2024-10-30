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

describe('TestCase e2e test', () => {
  const testCasePageUrl = '/test-case';
  const testCasePageUrlPattern = new RegExp('/test-case(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const testCaseSample = { input: 'mummify netsuke', expectedOutput: 'during wherever' };

  let testCase;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/test-cases+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/test-cases').as('postEntityRequest');
    cy.intercept('DELETE', '/api/test-cases/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (testCase) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/test-cases/${testCase.id}`,
      }).then(() => {
        testCase = undefined;
      });
    }
  });

  it('TestCases menu should load TestCases page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('test-case');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('TestCase').should('exist');
    cy.url().should('match', testCasePageUrlPattern);
  });

  describe('TestCase page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(testCasePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create TestCase page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/test-case/new$'));
        cy.getEntityCreateUpdateHeading('TestCase');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', testCasePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/test-cases',
          body: testCaseSample,
        }).then(({ body }) => {
          testCase = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/test-cases+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/test-cases?page=0&size=20>; rel="last",<http://localhost/api/test-cases?page=0&size=20>; rel="first"',
              },
              body: [testCase],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(testCasePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details TestCase page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('testCase');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', testCasePageUrlPattern);
      });

      it('edit button click should load edit TestCase page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TestCase');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', testCasePageUrlPattern);
      });

      it('edit button click should load edit TestCase page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TestCase');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', testCasePageUrlPattern);
      });

      it('last delete button click should delete instance of TestCase', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('testCase').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', testCasePageUrlPattern);

        testCase = undefined;
      });
    });
  });

  describe('new TestCase page', () => {
    beforeEach(() => {
      cy.visit(`${testCasePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TestCase');
    });

    it('should create an instance of TestCase', () => {
      cy.get(`[data-cy="input"]`).type('qua ouch');
      cy.get(`[data-cy="input"]`).should('have.value', 'qua ouch');

      cy.get(`[data-cy="expectedOutput"]`).type('quarrelsomely impressionable pasta');
      cy.get(`[data-cy="expectedOutput"]`).should('have.value', 'quarrelsomely impressionable pasta');

      cy.get(`[data-cy="description"]`).type('hutch loose hm');
      cy.get(`[data-cy="description"]`).should('have.value', 'hutch loose hm');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        testCase = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', testCasePageUrlPattern);
    });
  });
});
