/// <reference types="cypress" />
/// <reference path="../index.d.ts" />
import { ResourceState } from '../../src/common/lib/types';

describe.skip('User edits an opening period', () => {
  let dataPeriodId: string | undefined;
  const resourceId = Cypress.env('resourceId');
  const datePeriodTitlePrefix = 'e2e-test Muokkaamisen testijakson otsikko';
  const finnishTitle = `${datePeriodTitlePrefix} suomeksi ${new Date().toJSON()}`;
  const newFinnishTitle = `${datePeriodTitlePrefix} suomeksi muutettu ${new Date().toJSON()}`;
  const swedishTitle = `${datePeriodTitlePrefix} ruotsiksi ${new Date().toJSON()}`;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(new Date().getDate() + 1);
  const timeSpan = {
    name: { fi: '', sv: null, en: null },
    description: { fi: '', sv: null, en: null },
    end_time: '20:00:00',
    resource_state: ResourceState.OPEN,
    start_time: '12:00:00',
    weekdays: [1],
  };

  before(() => {
    cy.createDatePeriod({
      name: { fi: finnishTitle, sv: swedishTitle, en: null },
      startDate,
      endDate,
      resourceId,
      timeSpans: [timeSpan],
      rules: [],
    }).then((id: string) => {
      if (id) {
        dataPeriodId = id;
      }
    });
  });

  beforeEach(() => {
    cy.visitResourcePageAsAuthenticatedUser(resourceId);
  });

  it('User successfully edits an opening period', () => {
    // Enter in edit page from resource page
    cy.get('[data-test=resource-opening-periods-list]', {
      timeout: 10000,
    })
      .find(`[data-test="openingPeriodEditLink-${dataPeriodId}"]`)
      .click({ log: true });

    // Check that form exists
    cy.get('[data-test=edit-opening-period-form]', {
      timeout: 10000,
    }).should('be.visible');

    // Start editing by checking the finnish title
    cy.get('[data-test=opening-period-title-fi]')
      .invoke('val')
      .should('equal', finnishTitle);

    // And then check swedish title
    cy.get('[data-test=opening-period-title-sv]')
      .invoke('val')
      .should('equal', swedishTitle);

    // Change the finnish title
    cy.get('[data-test=opening-period-title-fi]')
      .clear()
      .type(newFinnishTitle, { log: true });

    // Change timespan data
    cy.get('[data-test=weekdays-monday-0-0-checkbox]').should('be.checked');
    cy.get('[data-test=weekdays-monday-0-0]').click();
    cy.get('[data-test=weekdays-monday-0-0-checkbox]').should('not.be.checked');

    cy.get('[data-test=weekdays-tuesday-0-0]').click();
    cy.get('[data-test=weekdays-tuesday-0-0-checkbox]').should('be.checked');

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

    // Save
    cy.get('[data-test=publish-opening-period-button]').click({
      force: true,
      log: true,
    });

    // Wait for success notification
    cy.get('[data-testid=opening-period-form-success]', {
      timeout: 10000,
    }).should('be.visible');

    // Check that updated title exists in the date-period's list item on the resource page
    cy.get(`[data-test="openingPeriod-${dataPeriodId}"]`, {
      timeout: 10000,
    }).should('contain', newFinnishTitle);
  });
});
