// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/// <reference path="../../src/globals.d.ts" />

import querystring, { ParsedUrlQueryInput } from 'querystring';
import {
  GroupRule,
  LanguageStrings,
  TimeSpan,
} from '../../src/common/lib/types';
import Chainable = Cypress.Chainable;
import PrevSubject = Cypress.PrevSubject;

Cypress.Commands.add(
  'visitResourcePageAsUnauthenticatedUser',
  (resourceId: string) => {
    cy.task('log', 'Starting visit as unauthenticated user');
    cy.visit(`/resource/${resourceId}`, {
      log: true,
    }).task('log', 'Visiting page as unauthenticated user');
  }
);

const visitPageAsAuthenticated = ({
  path,
  queryParams,
}: {
  path: string;
  queryParams?: ParsedUrlQueryInput;
}): Cypress.Chainable<Cypress.Exec> =>
  cy.exec('node ./scripts/generate-auth-params.js').then((params) => {
    const queryParameters: string[] = [
      queryParams ? querystring.stringify(queryParams) : '',
      params.stdout,
    ].filter((p) => p !== '');

    cy.task('log', 'Starting visit as authenticated user');
    cy.visit(`${path}?${queryParameters.join('&')}`, {
      log: true,
    }).task('log', 'Visiting the page as authenticated user');
  });

Cypress.Commands.add(
  'visitResourcePageAsAuthenticatedUser',
  (resourceId: string) => {
    visitPageAsAuthenticated({ path: `/resource/${resourceId}` });
  }
);

Cypress.Commands.add(
  'visitResourcePageAsAuthenticatedUserWithTargetResource',
  (resourceId: string, targetResource: string) => {
    visitPageAsAuthenticated({
      path: `/resource/${resourceId}`,
      queryParams: { target_resources: targetResource },
    });
  }
);

// HDS Navigation.LanguageSelector causes uncaught exceptions in Cypress tests. It has something to do with how the ResizeObserver library. This is a temporary fix to circumvent the issue.
Cypress.on('uncaught:exception', (err: Error): boolean | Error => {
  if (
    /ResizeObserver loop completed with undelivered notifications/.test(
      err.message
    )
  ) {
    return false;
  }

  return err;
});

const toJsonDate = (date: Date): string => date.toJSON().split('T')[0];

Cypress.Commands.add(
  'createDatePeriod',
  ({
    name,
    startDate,
    endDate,
    resourceId,
    timeSpans = [],
    rules = [],
  }: {
    name: LanguageStrings;
    startDate: Date;
    endDate: Date;
    resourceId: string;
    timeSpans?: TimeSpan[];
    rules?: GroupRule[];
  }): Chainable => {
    return cy
      .visit('/')
      .window()
      .then((win: Window) => {
        const apiUrl = win.ENV?.API_URL;

        if (!apiUrl) {
          throw new Error('API_URL is not set!!!');
        }

        return cy
          .exec('node ./scripts/generate-auth-params.js')
          .then((params) =>
            cy
              .request(
                'GET',
                `${apiUrl}/v1/resource/${resourceId}?${params.stdout}`
              )
              .then((resourceResponse) => {
                const data = {
                  resource: resourceResponse?.body?.id,
                  name,
                  description: {
                    fi: null,
                    sv: null,
                    en: null,
                  },
                  start_date: toJsonDate(startDate),
                  end_date: toJsonDate(endDate),
                  resource_state: 'undefined',
                  override: false,
                  time_span_groups: timeSpans
                    ? [
                        {
                          rules,
                          time_spans: timeSpans,
                        },
                      ]
                    : [],
                };
                cy.task(
                  'log',
                  `Creating date-period, ${apiUrl}, ${JSON.stringify(data)}`
                );

                return cy
                  .request({
                    method: 'POST',
                    headers: {
                      authorization: `haukisigned ${params.stdout}`,
                    },
                    url: `${apiUrl}/v1/date_period/`,
                    body: data,
                  })
                  .then((dataPeriodResponse) => dataPeriodResponse.body?.id);
              })
          );
      });
  }
);

Cypress.Commands.add('deleteDatePeriod', (id: number) => {
  cy.window().then((win: Window) => {
    const apiUrl = win.ENV?.API_URL;

    return cy.exec('node ./scripts/generate-auth-params.js').then((params) => {
      return cy.request({
        method: 'DELETE',
        headers: {
          authorization: `haukisigned ${params.stdout}`,
        },
        url: `${apiUrl}/v1/date_period/${id}/`,
      });
    });
  });
});

Cypress.Commands.add(
  'selectHdsDropdown',
  { prevSubject: 'optional' },
  (
    subject: PrevSubject | undefined,
    { id, value }: { id: string; value: string }
  ) => {
    const dropDownButtonSelector = `button#${id}-toggle-button`; // HDS component Select appends the part '-toggle-button' to the given id
    const startingChainable = (): Chainable =>
      subject
        ? cy.wrap(subject).get(dropDownButtonSelector)
        : cy.get(dropDownButtonSelector);

    return startingChainable()
      .click()
      .get(`li[id^=${id}-item]`)
      .contains(value)
      .click(); // HDS component Select appends the part '-item' in the option's id in addition to given component id
  }
);

Cypress.Commands.add(
  'setHdsTimeInputTime',
  { prevSubject: 'optional' },
  (
    subject: PrevSubject | undefined,
    { id, hours, minutes }: { id: string; hours: string; minutes: string }
  ) => {
    cy.get(`#${id}-hours`).type(hours);
    cy.get(`#${id}-minutes`).type(minutes);
  }
);
