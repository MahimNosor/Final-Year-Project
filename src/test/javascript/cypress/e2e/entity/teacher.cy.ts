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

describe('Teacher e2e test', () => {
  const teacherPageUrl = '/teacher';
  const teacherPageUrlPattern = new RegExp('/teacher(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const teacherSample = { name: 'funny abnormally', email: 'Watson63@gmail.com' };

  let teacher;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/teachers+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/teachers').as('postEntityRequest');
    cy.intercept('DELETE', '/api/teachers/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (teacher) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/teachers/${teacher.id}`,
      }).then(() => {
        teacher = undefined;
      });
    }
  });

  it('Teachers menu should load Teachers page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('teacher');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Teacher').should('exist');
    cy.url().should('match', teacherPageUrlPattern);
  });

  describe('Teacher page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(teacherPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Teacher page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/teacher/new$'));
        cy.getEntityCreateUpdateHeading('Teacher');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teacherPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/teachers',
          body: teacherSample,
        }).then(({ body }) => {
          teacher = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/teachers+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [teacher],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(teacherPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Teacher page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('teacher');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teacherPageUrlPattern);
      });

      it('edit button click should load edit Teacher page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Teacher');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teacherPageUrlPattern);
      });

      it('edit button click should load edit Teacher page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Teacher');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teacherPageUrlPattern);
      });

      it('last delete button click should delete instance of Teacher', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('teacher').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teacherPageUrlPattern);

        teacher = undefined;
      });
    });
  });

  describe('new Teacher page', () => {
    beforeEach(() => {
      cy.visit(`${teacherPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Teacher');
    });

    it('should create an instance of Teacher', () => {
      cy.get(`[data-cy="name"]`).type('unto glum sandy');
      cy.get(`[data-cy="name"]`).should('have.value', 'unto glum sandy');

      cy.get(`[data-cy="email"]`).type('Kraig.Wyman@gmail.com');
      cy.get(`[data-cy="email"]`).should('have.value', 'Kraig.Wyman@gmail.com');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        teacher = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', teacherPageUrlPattern);
    });
  });
});
