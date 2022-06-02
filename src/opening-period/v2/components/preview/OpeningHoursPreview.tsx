import React, { Fragment } from 'react';
import { Language, ResourceState } from '../../../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../../../common/utils/date-time/format';
import {
  OpeningHoursTimeSpan,
  OpeningHours,
  OptionType,
  OpeningHoursTimeSpanGroup,
} from '../../types';
import { groupOpeningHoursForPreview, sortTimeSpans } from './preview-helpers';
import './OpeningHoursPreview.scss';

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
    <table className="opening-hours-preview-table">
      <caption className="opening-hours-preview-table__caption">
        Esikatselu
      </caption>
      <thead className="opening-hours-preview-table__header">
        <tr>
          <th className="opening-hours-preview-table__day-column" scope="col">
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
        {/* For some reason when a new row gets inserted it first appears as undefined so need to filter those out */}
        {groupOpeningHoursForPreview(openingHours).map(
          (openingHour, openingHourIdx) => {
            const rowClass =
              openingHourIdx % 2 === 0
                ? 'time-span-row--even'
                : 'time-span-row--odd';

            return (
              <Fragment key={`time-spans-${openingHourIdx}`}>
                {openingHour.timeSpanGroups?.map(
                  (
                    timeSpanGroup: OpeningHoursTimeSpanGroup,
                    timeSpanGroupIdx: number
                  ) => (
                    <Fragment key={`time-span-group-${timeSpanGroupIdx}`}>
                      {timeSpanGroup.rule?.label !== 'Joka viikko' && (
                        <PreviewRow
                          className={rowClass}
                          label={
                            timeSpanGroupIdx === 0
                              ? createWeekdaysStringFromIndices(
                                  openingHour.weekdays,
                                  Language.FI
                                )
                              : ''
                          }
                          timeClassname="time-span-rule-label"
                          time={timeSpanGroup.rule?.label}
                        />
                      )}
                      {sortTimeSpans(timeSpanGroup.timeSpans).map(
                        (timeSpan, timeSpanIdx) => (
                          <Fragment key={`time-span-${timeSpanIdx}`}>
                            {timeSpanIdx === 0 ? (
                              <>
                                <TimeSpanRow
                                  key={`time-span-${timeSpanIdx}`}
                                  className={rowClass}
                                  label={
                                    timeSpanGroup.rule?.label === 'Joka viikko'
                                      ? createWeekdaysStringFromIndices(
                                          openingHour.weekdays,
                                          Language.FI
                                        )
                                      : ''
                                  }
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
                  )
                )}
              </Fragment>
            );
          }
        )}
      </tbody>
    </table>
  </div>
);
