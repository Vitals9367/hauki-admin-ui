import React from 'react';
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
          timeSpanGroup.time_spans.map((timeSpan) => (
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
