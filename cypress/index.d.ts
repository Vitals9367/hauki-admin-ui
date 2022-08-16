/// <reference types="cypress" />
/// <reference types="../src/common/lib/types" />

declare namespace Cypress {
  interface Chainable {
    visitResourcePageAsUnauthenticatedUser(id: string): void;
    visitResourcePageAsAuthenticatedUser(id: string): void;
    visitResourcePageAsAuthenticatedUserWithTargetResource(
      id: string,
      targetResource: string
    ): void;
    createDatePeriod: ({
      name,
      startDate,
      endDate,
      resourceId,
      timeSpans,
      rules,
    }: {
      name: LanguageStrings;
      startDate: Date;
      endDate: Date;
      resourceId: string;
      timeSpans?: Partial<TimeSpan>[];
      rules?: Partial<GroupRule>[];
    }) => Chainable;
    deleteDatePeriod: (id: number) => Chainable;
    selectHdsDropdown: ({
      id,
      value,
    }: {
      id: string;
      value: string;
    }) => Chainable;
    setHdsTimeInputTime: ({
      id,
      hours,
      minutes,
    }: {
      id: string;
      hours: string;
      minutes: string;
    }) => Chainable;
  }
}
