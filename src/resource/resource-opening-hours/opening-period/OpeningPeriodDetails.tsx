import React from 'react';
import { DatePeriod, UiDatePeriodConfig } from '../../../common/lib/types';
import { PreviewRows } from '../../../opening-period/v2/components/preview/OpeningHoursPreview';
import { apiDatePeriodToOpeningHours } from '../../../opening-period/v2/helpers/opening-hours-helpers';

export default function ({
  datePeriod,
  datePeriodConfig,
}: {
  datePeriod: DatePeriod;
  datePeriodConfig: UiDatePeriodConfig;
}): JSX.Element {
  const openingHours = apiDatePeriodToOpeningHours(datePeriod);

  return (
    <div className="date-period-details-container">
      <PreviewRows
        openingHours={openingHours}
        resourceStates={datePeriodConfig.resourceState.options}
      />
    </div>
  );
}
