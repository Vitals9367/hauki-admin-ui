import React, { Fragment } from 'react';
import { Language, ResourceState } from '../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHours, OptionType } from './types';
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
  <tr>
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
  label,
  resourceStates,
  timeSpan,
}: {
  label?: string;
  resourceStates: OptionType[];
  timeSpan?: OpeningHoursTimeSpan;
}): JSX.Element => (
  <PreviewRow
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
            Aukiolo
          </th>
          <th scope="col">Tila</th>
        </tr>
      </thead>
      <tbody>
        {/* For some reason when a new row gets inserted it first appears as undefined so need to filter those out */}
        {groupOpeningHoursForPreview(openingHours).map(
          (openingHour, openingHourIdx) => (
            <Fragment key={`timeSpans-${openingHourIdx}`}>
              {sortTimeSpans(
                openingHour.timeSpans
              ).map((openingHourTimeSpan, i) =>
                i === 0 ? (
                  <TimeSpanRow
                    key={`detail-${i}`}
                    label={createWeekdaysStringFromIndices(
                      openingHour.weekdays,
                      Language.FI
                    )}
                    resourceStates={resourceStates}
                    timeSpan={openingHourTimeSpan}
                  />
                ) : (
                  <TimeSpanRow
                    key={`detail-${i}`}
                    resourceStates={resourceStates}
                    timeSpan={openingHourTimeSpan}
                  />
                )
              )}
              {openingHour.alternating?.map((alternating, variableId) => (
                <Fragment key={`variable-${variableId}`}>
                  {alternating.timeSpans?.map((detail, detailIdx) => (
                    <Fragment key={`alternating-detail-${detailIdx}`}>
                      {detailIdx === 0 && (
                        <PreviewRow
                          timeClassname="alternating-time-span-label"
                          time={alternating.rule?.label}
                        />
                      )}
                      <TimeSpanRow
                        resourceStates={resourceStates}
                        timeSpan={detail}
                      />
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </Fragment>
          )
        )}
      </tbody>
    </table>
  </div>
);
