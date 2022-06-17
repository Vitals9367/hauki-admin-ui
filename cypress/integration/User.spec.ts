/// <reference types="cypress" />
/// <reference path="../index.d.ts" />
describe('Unauthenticated user', () => {
  beforeEach(() => {
    cy.visitResourcePageAsUnauthenticatedUser(Cypress.env('resourceId'));
  });

  it('Is redirected to unauthenticated page', () => {
    cy.location('pathname').should('equal', '/unauthenticated');
  });
});

describe('Authenticated user', () => {
  beforeEach(() => {
    cy.visitResourcePageAsAuthenticatedUser(Cypress.env('resourceId'));
  });

  it('should logout permanently on application close', () => {
    cy.location()
      .its('href')
      .then((resourcePageUrl) => {
        cy.get('[data-test="close-app-button"]').click();
        // have to wait here because cypress does not work optimal: https://github.com/cypress-io/cypress/issues/7306
        cy.wait(2000);
        cy.get('header')
          .first()
          .should('not.contain', Cypress.env('haukiUser'));
        cy.location('pathname').should('equal', '/');

        // Try to visit the resource page again
        cy.visit(resourcePageUrl);
        cy.get('header').first().should('not.contain', 'Kirjaudu ulos');
        cy.location('pathname').should('equal', '/unauthenticated');
      });
  });
});
