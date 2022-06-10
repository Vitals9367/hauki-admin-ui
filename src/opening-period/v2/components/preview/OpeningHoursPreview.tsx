import React, { Fragment } from 'react';
import { Language, ResourceState } from '../../../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHours, OptionType } from '../../types';
import { openingHoursToPreviewRows } from './preview-helpers';
import './OpeningHoursPreview.scss';

const emptyHours = '-- : --';

const TimeSpan = ({
  start,
  end,
}: {
  start?: string | null;
  end?: string | null;
}): JSX.Element => (
  <>
    <span className="opening-hours-preview-time-span__time">
      {start || emptyHours}
    </span>
    <span>-</span>
    <span className="opening-hours-preview-time-span__time">
      {end || emptyHours}
    </span>
  </>
);

const renderStartAndEndTimes = (
  timeSpan?: OpeningHoursTimeSpan
): JSX.Element => (
  <span className="opening-hours-preview-time-span">
    {timeSpan?.full_day ? (
      '24h'
    ) : (
      <TimeSpan start={timeSpan?.start_time} end={timeSpan?.end_time} />
    )}
  </span>
);

const resolveDescription = (
  resourceStates: OptionType[],
  timeSpan?: OpeningHoursTimeSpan
): string => {
  if (!timeSpan) {
    return 'Tuntematon';
  }

  if (timeSpan.resource_state === ResourceState.OPEN) {
    return '';
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
  <tr className={className}>
    <td className="opening-hours-preview-table__day-column">{label}</td>
    <td
      className={`opening-hours-preview-table__time-span-column ${
        className ?? ''
      }`}>
      <span className="opening-hours-preview-table__opening-hours">
        {timeSpan?.resource_state === ResourceState.CLOSED
          ? ''
          : renderStartAndEndTimes(timeSpan)}
        <span>{resolveDescription(resourceStates, timeSpan)}</span>
      </span>
    </td>
  </tr>
);

const OpeningHoursPreview = ({
  openingHours,
  resourceStates,
  rules,
  className,
}: {
  openingHours: OpeningHours[];
  resourceStates: OptionType[];
  rules: OptionType[];
  className?: string;
}): JSX.Element => (
  <div className={`card opening-hours-preview ${className || ''}`}>
    <h2 className="opening-hours-preview__title">Esikatselu</h2>
    {openingHoursToPreviewRows(openingHours).map(
      (previewRow, previewRowIdx) => (
        <table
          key={`preview-row-${previewRowIdx}`}
          className="opening-hours-preview-table">
          {previewRow.rule === 'week_every' ? null : (
            <caption className="opening-hours-preview-table__caption">
              {rules.find((rule) => rule.value === previewRow.rule)?.label}
            </caption>
          )}
          <thead className="opening-hours-preview-table__header">
            <tr>
              <th
                className="opening-hours-preview-table__day-column sr-only"
                scope="col">
                Päivä
              </th>
              <th
                className="opening-hours-preview-table__time-span-column sr-only"
                scope="col">
                Aukioloaika
              </th>
            </tr>
          </thead>
          <tbody>
            {previewRow.openingHours.map((openingHour, openingHourIdx) => {
              const rowClass =
                openingHourIdx % 2 === 0
                  ? 'time-span-row--odd'
                  : 'time-span-row--even';

              return (
                <Fragment key={`opening-hours-${openingHourIdx}`}>
                  {openingHour.timeSpans.map((timeSpan, timeSpanIdx) => (
                    <Fragment key={`time-span-${timeSpanIdx}`}>
                      <TimeSpanRow
                        key={`time-span-row-${timeSpanIdx}`}
                        className={rowClass}
                        label={
                          timeSpanIdx === 0
                            ? createWeekdaysStringFromIndices(
                                openingHour.weekdays,
                                Language.FI
                              )
                            : ''
                        }
                        resourceStates={resourceStates}
                        timeSpan={timeSpan}
                      />
                    </Fragment>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )
    )}
  </div>
);

export default OpeningHoursPreview;
