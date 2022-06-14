/// <reference types="cypress" />
/// <reference path="../index.d.ts" />
describe('User adds a new opening period', () => {
  const todayDay: number = new Date().getDate();
  const todayDayString: string =
    todayDay < 10 ? `0${todayDay}` : todayDay.toString();

  beforeEach(() => {
    cy.visitResourcePageAsAuthenticatedUser(Cypress.env('resourceId'));
  });

  it.skip('User successfully adds a new opening period', () => {
    // Begin from resource page
    cy.get('[data-test=resource-opening-periods-list] ', {
      timeout: 10000,
    }).should('be.visible');

    // Go to add new opening period page by pressing the header button
    cy.get('[data-test=add-new-opening-period-button]').click();

    // Check that add new opening period form is visible in the new page
    cy.get('[data-test=add-new-opening-period-form]', {
      timeout: 10000,
    }).should('be.visible');

    // Start filling the form, first is opening period title in finnish
    cy.get('[data-test=opening-period-title-fi').type(
      `e2e-test Testijakson otsikko ${new Date().toJSON()}`
    );
    // ...then in swedish
    cy.get('[data-test=opening-period-title-sv').type(
      `e2e-test test periods rubrik ${new Date().toJSON()}`
    );
    // ...then in english
    cy.get('[data-test=opening-period-title-en').type(
      `e2e-test test period's title ${new Date().toJSON()}`
    );

    // Then select the begin and end date for the period. For the test we wish to select
    // current date and the first date of the next month
    cy.get('[data-test=openingPeriodBeginDate]').click();
    cy.get('button[aria-label="Valitse alkupäivämäärä"]').click();
    cy.get(`[role="dialog"] button[data-date$="${todayDayString}"]`)
      .filter(':visible')
      .click({ force: true });
    cy.get('[data-test=openingPeriodEndDate]').click();
    cy.get('button[aria-label="Valitse loppupäivämäärä"]')
      .filter(':visible')
      .click();
    cy.get('[role="dialog"] button[aria-label="Seuraava kuukausi"]')
      .filter(':visible')
      .click();
    cy.get(`[role="dialog"] button[data-date$="01"]`)
      .filter(':visible')
      .click({ force: true });

    // Then enter time span data
    cy.get('[data-test=weekdays-monday-0-0]').click();
    cy.get('[data-test=weekdays-tuesday-0-0]').click();
    cy.get('[data-test=weekdays-wednesday-0-0]').click();
    cy.get('[data-test=weekdays-thursday-0-0]').click();
    cy.get('[data-test=weekdays-friday-0-0]').click();
    cy.setHdsTimeInputTime({
      id: 'time-span-0-0-start-time',
      hours: '08',
      minutes: '00',
    });
    cy.setHdsTimeInputTime({
      id: 'time-span-0-0-end-time',
      hours: '16',
      minutes: '00',
    });
    cy.selectHdsDropdown({ id: 'time-span-state-id-0-0', value: 'Auki' });

    // Try submit form
    cy.get('[data-test=publish-opening-period-button]').click();

    cy.get('[data-testid=opening-period-form-success]', {
      timeout: 10000,
    }).should('be.visible');
  });

  it.skip('User successfully adds a new opening period which is open through the period', () => {
    // Begin from resource page
    cy.get('[data-test=resource-opening-periods-list] ', {
      timeout: 10000,
    }).should('be.visible');

    // Go to add new opening period page by pressing the header button
    cy.get('[data-test=add-new-opening-period-button]').click();

    // Check that add new opening period form is visible in the new page
    cy.get('[data-test=add-new-opening-period-form]', {
      timeout: 10000,
    }).should('be.visible');

    // Start filling the form, first is opening period title
    cy.get('[data-test=opening-period-title-fi').type(
      `e2e-test Testijakson otsikko open constantly ${new Date().toJSON()}`
    );

    // Then select the resource state for the date-period
    cy.selectHdsDropdown({
      id: 'opening-period-resource-state',
      value: 'Auki',
    });

    // Try submit form
    cy.get('[data-test=publish-opening-period-button]').click();

    cy.get('[data-testid=opening-period-form-success]', {
      timeout: 10000,
    }).should('be.visible');
  });
});
