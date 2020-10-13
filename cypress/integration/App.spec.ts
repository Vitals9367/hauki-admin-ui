/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Open aukiolot app', () => {
  beforeEach(() => {
    cy.visit(`/target/${Cypress.env('target-id')}`);
  });

  it('Contains correct page title', () => {
    cy.contains('Aukiolot');
  });

  it('Has no detectable a11y violations on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});