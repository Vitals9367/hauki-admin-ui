import React, { Fragment } from 'react';
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
  timeClassname,
  label,
  time,
  description,
}: {
  timeClassname?: string;
  label?: string;
  time?: JSX.Element | string | null | undefined;
  description?: string;
}): JSX.Element => (
  <>
    <p>{label}</p>
    <p className={timeClassname}>{time}</p>
    <p>{description}</p>
  </>
);

const TimeSpanRow = ({
  isOpen = true,
  label,
  timeSpan,
}: {
  isOpen?: boolean;
  label?: string;
  timeSpan?: OpeningHoursTimeSpan;
}): JSX.Element => (
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

export default ({
  data: { openingHours },
}: {
  data: OpeningHoursFormState;
}): JSX.Element => (
  <div className="opening-hours-preview-container">
    <h2>Esikatselu</h2>
    <div className="opening-hours-preview-grid">
      {openingHours.map((openingHour, openingHourIdx) => (
        <Fragment key={`normal-${openingHourIdx}`}>
          <TimeSpanRow
            isOpen={openingHour.isOpen}
            label={createWeekdaysStringFromIndices(
              toWeekdays(openingHour.days),
              Language.FI
            )}
            timeSpan={openingHour.normal?.normal}
          />
          {openingHour.normal?.details?.map((detail, detailIdx) => (
            <Fragment key={`detail-${detailIdx}`}>
              <TimeSpanRow timeSpan={detail} />
            </Fragment>
          ))}
          {openingHour.alternating?.map((alternating, variableId) => (
            <Fragment key={`variable-${variableId}`}>
              <PreviewRow
                timeClassname="alternating-time-span-label"
                time={alternating.rule?.label}
              />
              <TimeSpanRow timeSpan={alternating.normal} />
              {alternating.details?.map((detail, detailIdx) => (
                <Fragment key={`alternating-detail-${detailIdx}`}>
                  <TimeSpanRow timeSpan={detail} />
                </Fragment>
              ))}
            </Fragment>
          ))}
        </Fragment>
      ))}
    </div>
  </div>
);
