/// <reference types="cypress" />
/// <reference types="cypress-axe" />
/// <reference path="../index.d.ts" />

describe('User visits resource page with target resource', () => {
  beforeEach(() => {
    cy.visitResourcePageAsAuthenticatedUserWithTargetResource(
      Cypress.env('resourceId'),
      Cypress.env('targetResourceId')
    );
  });

  it.skip('Contains copy section title and copy button', () => {
    cy.contains('Olet valinnut joukkopäivityksessä 2 pistettä');
    cy.contains('Päivitä aukiolotiedot 1 muuhun toimipisteeseen');
  });
});
