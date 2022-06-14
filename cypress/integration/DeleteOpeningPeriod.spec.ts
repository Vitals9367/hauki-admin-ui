/// <reference types="cypress" />
/// <reference path="../index.d.ts" />

describe.skip('User deletes an opening period', () => {
  let dataPeriodId: string | undefined;
  const resourceId = Cypress.env('resourceId');
  const datePeriodTitlePrefix = 'e2e-test Poistamisen testijakson otsikko';
  const newTitle = `${datePeriodTitlePrefix} ${new Date().toJSON()}`;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(new Date().getDate() + 1);

  before(() => {
    cy.createDatePeriod({
      name: newTitle,
      startDate,
      endDate,
      resourceId,
    }).then((id: string) => {
      if (id) {
        dataPeriodId = id;
      }
    });
  });

  beforeEach(() => {
    cy.visitResourcePageAsAuthenticatedUser(resourceId);
  });

  it('User successfully deletes an opening period', () => {
    // Enter in delete modal by clicking the delete-button
    cy.get('[data-test=resource-opening-periods-list]', {
      timeout: 10000,
    })
      .find(`[data-test="openingPeriodDeleteLink-${dataPeriodId}"]`)
      .click({ log: true });

    // Check that delete modal exists
    cy.get('[data-test=modalTitle]', {
      timeout: 10000,
    }).should('exist');

    // Click delete modal confirm button
    cy.get('[data-test=modalConfirmButton]').click();

    // Check that date-period has disappeared
    cy.get('[data-test=resource-opening-periods-list]', {
      timeout: 10000,
    })
      .find(`[data-test="openingPeriod-${dataPeriodId}"]`)
      .should('not.exist');
  });
});
