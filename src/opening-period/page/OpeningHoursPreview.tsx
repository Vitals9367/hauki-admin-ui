import React from 'react';
import { Language, ResourceState } from '../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHoursFormState } from './types';
import { toWeekdays } from './utils';
import './OpeningHoursPreview.scss';

function renderStartAndEndTimes(
  startTime?: string | null,
  endTime?: string | null,
  fullDay?: boolean,
  isClosed?: boolean
): string {
  if (isClosed) {
    return '--:--  -  --:--';
  }

  if (fullDay) {
    return '24h';
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
  <div className="opening-hours-preview-container">
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
          {openingHour.normal?.details?.map((detail, detailIdx) => (
            <div key={`detail-${detailIdx}`}>
              <TimeSpanRow timeSpan={detail} />
            </div>
          ))}
        </div>
        {openingHour.alternating?.map((alternating, variableId) => (
          <div key={`variable-${variableId}`}>
            <PreviewRow time={alternating.rule?.label} />
            <TimeSpanRow timeSpan={alternating.normal} />
            {alternating.details?.map((detail, detailIdx) => (
              <div key={`alternating-detail-${detailIdx}`}>
                <TimeSpanRow timeSpan={detail} />
              </div>
            ))}
          </div>
        ))}
      </div>
    ))}
  </div>
);
