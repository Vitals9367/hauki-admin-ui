import React from 'react';
import { apiTimeSpanToTimeSpan } from '../../common/helpers/opening-hours-helpers';
import {
  DatePeriod,
  ResourceState,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import { TimeSpan } from '../opening-hours-preview/OpeningHoursPreview';

type Props = {
  datePeriod: DatePeriod;
  datePeriodConfig?: UiDatePeriodConfig;
};

const ExceptionOpeningHours = ({
  datePeriod,
  datePeriodConfig,
}: Props): JSX.Element => (
  <div>
    {datePeriod.resource_state === ResourceState.CLOSED
      ? 'Suljettu'
      : datePeriod.time_span_groups.map((timeSpanGroup) =>
          timeSpanGroup.time_spans
            .map(apiTimeSpanToTimeSpan)
            .map((timeSpan) => (
              <TimeSpan
                key={timeSpan.id}
                resourceStates={datePeriodConfig?.resourceState.options || []}
                timeSpan={timeSpan}
              />
            ))
        )}
  </div>
);

export default ExceptionOpeningHours;
