import React from 'react';
import { Language, ResourceState } from '../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHoursFormState } from './types';
import { toWeekdays } from './utils';
import './OpeningHoursRangePreview.scss';

function renderStartAndEndTimes(
  startTime?: string | null,
  endTime?: string | null,
  fullDay?: boolean,
  isClosed?: boolean
): string {
  if (fullDay) {
    if (isClosed) {
      return '--:--';
    }
    return '24h';
  }

  if (isClosed) {
    return '--:--  -  --:--';
  }

  return `${startTime ?? ''} - ${endTime ?? ''}`;
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
  isOpen = true,
  label,
  timeSpan,
}: {
  isOpen?: boolean;
  label?: string;
  timeSpan?: OpeningHoursTimeSpan;
}): JSX.Element => {
  return (
    <PreviewRow
      label={label}
      time={renderStartAndEndTimes(
        timeSpan?.start,
        timeSpan?.end,
        timeSpan?.fullDay,
        !isOpen ||
          (timeSpan?.state?.value as ResourceState) === ResourceState.CLOSED
      )}
      description={
        timeSpan?.state?.value === ResourceState.OTHER
          ? timeSpan.description
          : timeSpan?.state?.label ?? 'Suljettu'
      }
    />
  );
};

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
            isOpen={openingHour.isOpen}
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
