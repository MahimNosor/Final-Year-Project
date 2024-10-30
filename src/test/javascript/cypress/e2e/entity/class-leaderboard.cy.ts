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

describe('ClassLeaderboard e2e test', () => {
  const classLeaderboardPageUrl = '/class-leaderboard';
  const classLeaderboardPageUrlPattern = new RegExp('/class-leaderboard(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const classLeaderboardSample = { rank: 28901, totalPoints: 5337 };

  let classLeaderboard;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/class-leaderboards+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/class-leaderboards').as('postEntityRequest');
    cy.intercept('DELETE', '/api/class-leaderboards/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (classLeaderboard) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/class-leaderboards/${classLeaderboard.id}`,
      }).then(() => {
        classLeaderboard = undefined;
      });
    }
  });

  it('ClassLeaderboards menu should load ClassLeaderboards page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('class-leaderboard');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ClassLeaderboard').should('exist');
    cy.url().should('match', classLeaderboardPageUrlPattern);
  });

  describe('ClassLeaderboard page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(classLeaderboardPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ClassLeaderboard page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/class-leaderboard/new$'));
        cy.getEntityCreateUpdateHeading('ClassLeaderboard');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', classLeaderboardPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/class-leaderboards',
          body: classLeaderboardSample,
        }).then(({ body }) => {
          classLeaderboard = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/class-leaderboards+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [classLeaderboard],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(classLeaderboardPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details ClassLeaderboard page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('classLeaderboard');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', classLeaderboardPageUrlPattern);
      });

      it('edit button click should load edit ClassLeaderboard page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ClassLeaderboard');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', classLeaderboardPageUrlPattern);
      });

      it('edit button click should load edit ClassLeaderboard page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ClassLeaderboard');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', classLeaderboardPageUrlPattern);
      });

      it('last delete button click should delete instance of ClassLeaderboard', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('classLeaderboard').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', classLeaderboardPageUrlPattern);

        classLeaderboard = undefined;
      });
    });
  });

  describe('new ClassLeaderboard page', () => {
    beforeEach(() => {
      cy.visit(`${classLeaderboardPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ClassLeaderboard');
    });

    it('should create an instance of ClassLeaderboard', () => {
      cy.get(`[data-cy="rank"]`).type('22480');
      cy.get(`[data-cy="rank"]`).should('have.value', '22480');

      cy.get(`[data-cy="totalPoints"]`).type('825');
      cy.get(`[data-cy="totalPoints"]`).should('have.value', '825');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        classLeaderboard = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', classLeaderboardPageUrlPattern);
    });
  });
});
