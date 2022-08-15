/// <reference types="cypress" />
/// <reference path="../index.d.ts" />
describe('User adds a new exception date period', () => {
  beforeEach(() => {
    cy.visitResourcePageAsAuthenticatedUser(Cypress.env('resourceId'));
  });

  it('Users successfully adds a new exception opening hours', () => {
    // Go to add new openings hours
    cy.get('[data-test=add-new-exception-period-button]').click();

    // Fill in opening hours

    // Start filling the form, first is opening period title in finnish
    cy.get('[data-test=opening-period-title-fi').type(
      `e2e-test poikkeavan Testijakson otsikko ${new Date().toJSON()}`
    );

    // ...then in swedish
    cy.get('[data-test=opening-period-title-sv').type(
      `e2e-test undantag test periods rubrik ${new Date().toJSON()}`
    );
    // ...then in english
    cy.get('[data-test=opening-period-title-en').type(
      `e2e-test exception test period's title ${new Date().toJSON()}`
    );
    cy.get('[data-test=exception-date]').click();
    cy.get('button[aria-label="Valitse päivämäärä"]').click();

    cy.get(`[role="dialog"] button[data-date$="31"]`)
      .filter(':visible')
      .click({ force: true });

    cy.get(
      'label[for="exception-opening-hours-form-open-state-checkbox"]'
    ).click();

    cy.setHdsTimeInputTime({
      id: 'openingHours-0-timeSpanGroups-0-timeSpans-0-start-time',
      hours: '08',
      minutes: '00',
    });
    cy.setHdsTimeInputTime({
      id: 'openingHours-0-timeSpanGroups-0-timeSpans-0-end-time',
      hours: '16',
      minutes: '00',
    });

    // Add time span with state Itsepalvelu
    cy.get(
      '[data-test="openingHours-0-timeSpanGroups-0-timeSpans-add-time-span-button"'
    ).click();

    cy.selectHdsDropdown({
      id: 'openingHours-0-timeSpanGroups-0-timeSpans-1-resource_state',
      value: 'Itsepalvelu',
    });

    cy.setHdsTimeInputTime({
      id: 'openingHours-0-timeSpanGroups-0-timeSpans-1-start-time',
      hours: '16',
      minutes: '00',
    });

    cy.setHdsTimeInputTime({
      id: 'openingHours-0-timeSpanGroups-0-timeSpans-1-end-time',
      hours: '17',
      minutes: '00',
    });

    // Save opening hours
    cy.get('[data-test=submit-opening-hours-button]').click();

    cy.get('[data-testid=exception-opening-hours-form-success]', {
      timeout: 10000,
    }).should('be.visible');
  });
});
