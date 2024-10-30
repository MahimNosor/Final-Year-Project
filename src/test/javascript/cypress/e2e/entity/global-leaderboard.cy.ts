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

describe('GlobalLeaderboard e2e test', () => {
  const globalLeaderboardPageUrl = '/global-leaderboard';
  const globalLeaderboardPageUrlPattern = new RegExp('/global-leaderboard(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const globalLeaderboardSample = { rank: 11373, totalPoints: 4421 };

  let globalLeaderboard;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/global-leaderboards+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/global-leaderboards').as('postEntityRequest');
    cy.intercept('DELETE', '/api/global-leaderboards/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (globalLeaderboard) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/global-leaderboards/${globalLeaderboard.id}`,
      }).then(() => {
        globalLeaderboard = undefined;
      });
    }
  });

  it('GlobalLeaderboards menu should load GlobalLeaderboards page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('global-leaderboard');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('GlobalLeaderboard').should('exist');
    cy.url().should('match', globalLeaderboardPageUrlPattern);
  });

  describe('GlobalLeaderboard page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(globalLeaderboardPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create GlobalLeaderboard page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/global-leaderboard/new$'));
        cy.getEntityCreateUpdateHeading('GlobalLeaderboard');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', globalLeaderboardPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/global-leaderboards',
          body: globalLeaderboardSample,
        }).then(({ body }) => {
          globalLeaderboard = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/global-leaderboards+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [globalLeaderboard],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(globalLeaderboardPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details GlobalLeaderboard page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('globalLeaderboard');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', globalLeaderboardPageUrlPattern);
      });

      it('edit button click should load edit GlobalLeaderboard page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('GlobalLeaderboard');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', globalLeaderboardPageUrlPattern);
      });

      it('edit button click should load edit GlobalLeaderboard page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('GlobalLeaderboard');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', globalLeaderboardPageUrlPattern);
      });

      it('last delete button click should delete instance of GlobalLeaderboard', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('globalLeaderboard').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', globalLeaderboardPageUrlPattern);

        globalLeaderboard = undefined;
      });
    });
  });

  describe('new GlobalLeaderboard page', () => {
    beforeEach(() => {
      cy.visit(`${globalLeaderboardPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('GlobalLeaderboard');
    });

    it('should create an instance of GlobalLeaderboard', () => {
      cy.get(`[data-cy="rank"]`).type('19979');
      cy.get(`[data-cy="rank"]`).should('have.value', '19979');

      cy.get(`[data-cy="totalPoints"]`).type('30478');
      cy.get(`[data-cy="totalPoints"]`).should('have.value', '30478');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        globalLeaderboard = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', globalLeaderboardPageUrlPattern);
    });
  });
});
