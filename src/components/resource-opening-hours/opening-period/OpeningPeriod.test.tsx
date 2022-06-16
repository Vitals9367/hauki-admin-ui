import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { datePeriodOptions } from '../../../../test/fixtures/api-options';
import { datePeriod } from '../../../../test/fixtures/api-date-period';
import {
  DatePeriod,
  Language,
  UiDatePeriodConfig,
} from '../../../common/lib/types';
import OpeningPeriod from './OpeningPeriod';

const testDatePeriod: DatePeriod = datePeriod;
const testDatePeriodOptions: UiDatePeriodConfig = datePeriodOptions;

describe(`<OpeningPeriod />`, () => {
  it('should show opening period', async () => {
    const { container } = render(
      <Router>
        <OpeningPeriod
          initiallyOpen={false}
          resourceId={1}
          datePeriod={testDatePeriod}
          language={Language.FI}
          datePeriodConfig={testDatePeriodOptions}
          deletePeriod={(): Promise<void> => Promise.resolve()}
        />
      </Router>
    );

    expect(
      await container.querySelector('div[data-test="openingPeriod-1"]')
    ).toBeInTheDocument();
  });
});
