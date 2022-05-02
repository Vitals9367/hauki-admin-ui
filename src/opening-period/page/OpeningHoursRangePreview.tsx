import React from 'react';
import { Language, ResourceState } from '../../common/lib/types';
import {
  createWeekdaysStringFromIndices,
  dropMilliseconds,
} from '../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHoursFormState } from './types';
import { toWeekdays } from './utils';
import './OpeningHoursRangePreview.scss';

function renderStartAndEndTimes(
  startTime?: string | null,
  endTime?: string | null,
  fullDay?: boolean,
  resourceState?: ResourceState
): string {
  if (fullDay) {
    if (resourceState === ResourceState.CLOSED) {
      return '';
    }
    return '24h';
  }

  return `${startTime ? dropMilliseconds(startTime) : ''} - ${
    endTime ? dropMilliseconds(endTime) : ''
  }`;
}

const PreviewRow = ({
  label,
  time,
  description,
}: {
  label?: string;
  time?: string | null | undefined;
  description?: string;
}): JSX.Element => (
  <div className="time-span-row">
    <p>{label}</p>
    <p>{time}</p>
    <p>{description}</p>
  </div>
);

const TimeSpanRow = ({
  label,
  timeSpan,
}: {
  label?: string;
  timeSpan?: OpeningHoursTimeSpan;
}): JSX.Element => (
  <PreviewRow
    label={label}
    time={
      timeSpan &&
      renderStartAndEndTimes(
        timeSpan.start,
        timeSpan.end,
        timeSpan.fullDay,
        timeSpan.state?.value as ResourceState
      )
    }
    description={
      timeSpan?.state?.value === ResourceState.OTHER
        ? timeSpan.description
        : timeSpan?.state?.label ?? ''
    }
  />
);

export default ({
  data: { openingHours },
}: {
  data: OpeningHoursFormState;
}): JSX.Element => (
  <div className="opening-hours-range-preview-container">
    <h2>Esikatselu</h2>
    {openingHours.map((openingHour, openingHourIdx) => (
      <div key={`normal-${openingHourIdx}`}>
        <div>
          <TimeSpanRow
            label={createWeekdaysStringFromIndices(
              toWeekdays(openingHour.days),
              Language.FI
            )}
            timeSpan={openingHour.normal?.normal}
          />
          {openingHour.normal?.exceptions?.map((exception, exceptionIdx) => (
            <div key={`exception-${exceptionIdx}`}>
              <TimeSpanRow timeSpan={exception} />
            </div>
          ))}
        </div>
        {openingHour.variable?.map((variable, variableId) => (
          <div key={`variable-${variableId}`}>
            <PreviewRow time={variable.rule?.label} />
            <TimeSpanRow timeSpan={variable.normal} />
            {variable.exceptions?.map((exception, exceptionIdx) => (
              <div key={`variable-exception-${exceptionIdx}`}>
                <TimeSpanRow timeSpan={exception} />
              </div>
            ))}
          </div>
        ))}
      </div>
    ))}
  </div>
);
