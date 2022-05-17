import React, { Fragment } from 'react';
import { Language, ResourceState } from '../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../common/utils/date-time/format';
import { OpeningHoursTimeSpan, OpeningHours, OptionType } from './types';
import { groupOpeningHoursForPreview } from './utils';
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
      {start || '-- : --'}
    </span>
    <span>-</span>
    <span className="opening-hours-preview-time-span__time opening-hours-preview-time-span__time--end">
      {end || '-- : --'}
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
  isOpen: boolean,
  timeSpan?: OpeningHoursTimeSpan
): string => {
  if (!isOpen) {
    return 'Suljettu';
  }

  if (!timeSpan) {
    return 'Tuntematon';
  }

  return timeSpan.resourceState === ResourceState.OTHER
    ? timeSpan.description?.fi!
    : resourceStates.find((state) => state.value === timeSpan.resourceState)
        ?.label ?? 'Tuntematon';
};

const TimeSpanRow = ({
  isOpen = true,
  label,
  resourceStates,
  timeSpan,
}: {
  isOpen?: boolean;
  label?: string;
  resourceStates: OptionType[];
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
    description={resolveDescription(resourceStates, isOpen, timeSpan)}
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
        {groupOpeningHoursForPreview(openingHours.filter((o) => o)).map(
          (openingHour, openingHourIdx) => (
            <Fragment key={`timeSpans-${openingHourIdx}`}>
              {openingHour.timeSpans?.map((openingHourTimeSpan, i) =>
                i === 0 ? (
                  <TimeSpanRow
                    key={`detail-${i}`}
                    isOpen={openingHour.isOpen}
                    label={createWeekdaysStringFromIndices(
                      openingHour.days,
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
