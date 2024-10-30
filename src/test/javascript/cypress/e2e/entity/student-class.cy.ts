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

describe('StudentClass e2e test', () => {
  const studentClassPageUrl = '/student-class';
  const studentClassPageUrlPattern = new RegExp('/student-class(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const studentClassSample = { className: 'secret' };

  let studentClass;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/student-classes+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/student-classes').as('postEntityRequest');
    cy.intercept('DELETE', '/api/student-classes/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (studentClass) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/student-classes/${studentClass.id}`,
      }).then(() => {
        studentClass = undefined;
      });
    }
  });

  it('StudentClasses menu should load StudentClasses page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('student-class');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('StudentClass').should('exist');
    cy.url().should('match', studentClassPageUrlPattern);
  });

  describe('StudentClass page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(studentClassPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create StudentClass page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/student-class/new$'));
        cy.getEntityCreateUpdateHeading('StudentClass');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', studentClassPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/student-classes',
          body: studentClassSample,
        }).then(({ body }) => {
          studentClass = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/student-classes+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/student-classes?page=0&size=20>; rel="last",<http://localhost/api/student-classes?page=0&size=20>; rel="first"',
              },
              body: [studentClass],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(studentClassPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details StudentClass page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('studentClass');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', studentClassPageUrlPattern);
      });

      it('edit button click should load edit StudentClass page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('StudentClass');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', studentClassPageUrlPattern);
      });

      it('edit button click should load edit StudentClass page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('StudentClass');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', studentClassPageUrlPattern);
      });

      it('last delete button click should delete instance of StudentClass', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('studentClass').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', studentClassPageUrlPattern);

        studentClass = undefined;
      });
    });
  });

  describe('new StudentClass page', () => {
    beforeEach(() => {
      cy.visit(`${studentClassPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('StudentClass');
    });

    it('should create an instance of StudentClass', () => {
      cy.get(`[data-cy="className"]`).type('gee');
      cy.get(`[data-cy="className"]`).should('have.value', 'gee');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        studentClass = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', studentClassPageUrlPattern);
    });
  });
});
