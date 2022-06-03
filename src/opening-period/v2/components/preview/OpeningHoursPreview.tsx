import React, { Fragment } from 'react';
import { Language, ResourceState } from '../../../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHours, OptionType } from '../../types';
import { groupOpeningHoursForPreview } from './preview-helpers';
import './OpeningHoursPreview.scss';
import { byWeekdays } from '../../helpers/opening-hours-helpers';

const sortTimeSpans = (
  timeSpans: OpeningHoursTimeSpan[]
): OpeningHoursTimeSpan[] =>
  [...timeSpans].sort((a, b) => {
    return a.start_time ? a.start_time.localeCompare(b.start_time ?? '') : 1;
  });

const TimeSpan = ({
  start,
  end,
}: {
  start?: string | null;
  end?: string | null;
}): JSX.Element => (
  <>
    <span className="opening-hours-preview-time-span__time">
      {start || '-- : --'}
    </span>
    <span>-</span>
    <span className="opening-hours-preview-time-span__time opening-hours-preview-time-span__time--end">
      {end || '-- : --'}
    </span>
  </>
);

const renderStartAndEndTimes = (
  timeSpan?: OpeningHoursTimeSpan
): JSX.Element => (
  <span className="opening-hours-preview-time-span">
    {timeSpan?.resource_state !== ResourceState.CLOSED && timeSpan?.full_day ? (
      '24h'
    ) : (
      <TimeSpan start={timeSpan?.start_time} end={timeSpan?.end_time} />
    )}
  </span>
);

const PreviewRow = ({
  className,
  timeClassname,
  label,
  time,
  description,
}: {
  className: string;
  timeClassname?: string;
  label?: string;
  time?: JSX.Element | string | null | undefined;
  description?: string;
}): JSX.Element => (
  <tr className={className}>
    <td className="opening-hours-preview-table__day-column">{label}</td>
    <td
      className={`opening-hours-preview-table__time-span-column ${
        timeClassname ?? ''
      }`}>
      {time}
    </td>
    <td>{description}</td>
  </tr>
);

const resolveDescription = (
  resourceStates: OptionType[],
  timeSpan?: OpeningHoursTimeSpan
): string => {
  if (!timeSpan) {
    return 'Tuntematon';
  }

  return timeSpan.resource_state === ResourceState.OTHER
    ? timeSpan.description?.fi!
    : resourceStates.find((state) => state.value === timeSpan.resource_state)
        ?.label ?? 'Tuntematon';
};

const TimeSpanRow = ({
  className,
  label,
  resourceStates,
  timeSpan,
}: {
  className: string;
  label?: string;
  resourceStates: OptionType[];
  timeSpan?: OpeningHoursTimeSpan;
}): JSX.Element => (
  <PreviewRow
    className={className}
    description={resolveDescription(resourceStates, timeSpan)}
    label={label}
    time={renderStartAndEndTimes(timeSpan)}
  />
);

export default ({
  openingHours,
  resourceStates,
}: {
  openingHours: OpeningHours[];
  resourceStates: OptionType[];
}): JSX.Element => (
  <div className="opening-hours-preview-container">
    <h2 className="opening-hours-preview-title">Esikatselu</h2>
    {groupOpeningHoursForPreview(openingHours)
      .sort((a, b) => a.rule?.value.localeCompare(b.rule?.value ?? '') ?? 0)
      .map((previewRow) => (
        <div className="opening-hours-preview-table-container">
          <table className="opening-hours-preview-table">
            <caption className="opening-hours-preview-table__caption">
              {previewRow.rule?.value === '0' ? '' : previewRow.rule?.label}
            </caption>
            <thead className="opening-hours-preview-table__header">
              <tr>
                <th
                  className="opening-hours-preview-table__day-column"
                  scope="col">
                  Päivä
                </th>
                <th
                  className="opening-hours-preview-table__time-span-column"
                  scope="col">
                  Kellonaika
                </th>
                <th scope="col">Aukiolon tyyppi</th>
              </tr>
            </thead>
            <tbody>
              {previewRow.openingHours
                .sort(byWeekdays)
                .map((openingHour, openingHourIdx) => {
                  const rowClass =
                    openingHourIdx % 2 === 0
                      ? 'time-span-row--odd'
                      : 'time-span-row--even';

                  return (
                    <Fragment key={`opening-hours-${openingHourIdx}`}>
                      {sortTimeSpans(openingHour.timeSpans).map(
                        (timeSpan, timeSpanIdx) => (
                          <Fragment key={`time-span-${timeSpanIdx}`}>
                            {timeSpanIdx === 0 ? (
                              <>
                                <TimeSpanRow
                                  key={`time-span-${timeSpanIdx}`}
                                  className={rowClass}
                                  label={createWeekdaysStringFromIndices(
                                    openingHour.weekdays,
                                    Language.FI
                                  )}
                                  resourceStates={resourceStates}
                                  timeSpan={timeSpan}
                                />
                              </>
                            ) : (
                              <TimeSpanRow
                                key={`time-span-${timeSpanIdx}`}
                                className={rowClass}
                                resourceStates={resourceStates}
                                timeSpan={timeSpan}
                              />
                            )}
                          </Fragment>
                        )
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
  </div>
);
