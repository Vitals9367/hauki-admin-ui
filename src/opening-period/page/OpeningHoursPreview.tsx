import React from 'react';
import { Language, ResourceState } from '../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHoursFormState } from './types';
import { toWeekdays } from './utils';
import './OpeningHoursPreview.scss';

const TimeSpan = ({
  start,
  end,
}: {
  start?: string;
  end?: string;
}): JSX.Element => (
  <>
    <span className="opening-hours-preview-time-span__time">
      {start ?? '-- : --'}
    </span>
    <span>-</span>
    <span className="opening-hours-preview-time-span__time opening-hours-preview-time-span__time--end">
      {end ?? '-- : --'}
    </span>
  </>
);

const renderStartAndEndTimes = (
  startTime?: string,
  endTime?: string,
  fullDay?: boolean,
  isOpen?: boolean
): JSX.Element => (
  <span className="opening-hours-preview-time-span">
    {isOpen && fullDay ? (
      '24h'
    ) : (
      <TimeSpan
        start={isOpen ? startTime : undefined}
        end={isOpen ? endTime : undefined}
      />
    )}
  </span>
);

const PreviewRow = ({
  label,
  time,
  description,
}: {
  label?: string;
  time?: JSX.Element | string | null | undefined;
  description?: string;
}): JSX.Element => (
  <div className="time-span-row">
    <p>{label}</p>
    <p>{time}</p>
    <p>{description}</p>
  </div>
);

const TimeSpanRow = ({
  isOpen: isOpenOuter = true,
  label,
  timeSpan,
}: {
  isOpen?: boolean;
  label?: string;
  timeSpan?: OpeningHoursTimeSpan;
}): JSX.Element => {
  const isOpen =
    isOpenOuter &&
    (timeSpan?.state?.value as ResourceState) !== ResourceState.CLOSED;
  return (
    <PreviewRow
      label={label}
      time={renderStartAndEndTimes(
        timeSpan?.start,
        timeSpan?.end,
        timeSpan?.fullDay,
        isOpen
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
