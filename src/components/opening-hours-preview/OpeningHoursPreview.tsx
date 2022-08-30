import React, { Fragment } from 'react';
import { useAppContext } from '../../App-context';
import { openingHoursToPreviewRows } from '../../common/helpers/preview-helpers';
import {
  Language,
  ResourceState,
  TranslatedApiChoice,
  OpeningHours,
  TimeSpan as TTimespan,
} from '../../common/lib/types';
import { createWeekdaysStringFromIndices } from '../../common/utils/date-time/format';
import { uiFrequencyRules } from '../../constants';
import './OpeningHoursPreview.scss';

const TimeSpanDescription = ({
  language,
  resourceStates,
  timeSpan,
}: {
  language: Language;
  resourceStates: TranslatedApiChoice[];
  timeSpan?: TTimespan;
}): JSX.Element | null => {
  if (!timeSpan) {
    return <>Tuntematon</>;
  }

  if (timeSpan.resource_state === ResourceState.OPEN) {
    return null;
  }

  return (
    <>
      {resourceStates.find((state) => state.value === timeSpan.resource_state)
        ?.label[language] ?? 'Tuntematon'}
    </>
  );
};

const emptyHours = '-- : --';

export const TimeSpan = ({
  resourceStates,
  timeSpan,
}: {
  resourceStates: TranslatedApiChoice[];
  timeSpan?: TTimespan;
}): JSX.Element | null => {
  const { language = Language.FI } = useAppContext();
  if (!timeSpan) {
    return null;
  }

  const isClosed =
    !timeSpan.start_time &&
    !timeSpan.end_time &&
    timeSpan.resource_state === ResourceState.CLOSED;

  return (
    <span className="opening-hours-preview-time-span-container">
      {!isClosed && (
        <span className="opening-hours-preview-time-span">
          {timeSpan?.full_day ? (
            '24h'
          ) : (
            <>
              <span className="opening-hours-preview-time-span__time">
                {timeSpan?.start_time?.substring(0, 5) || emptyHours}
              </span>
              <span>-</span>
              <span className="opening-hours-preview-time-span__time">
                {timeSpan?.end_time?.substring(0, 5) || emptyHours}
              </span>
            </>
          )}
        </span>
      )}
      <TimeSpanDescription
        language={language}
        resourceStates={resourceStates}
        timeSpan={timeSpan}
      />
      <span>{timeSpan.description[language]}</span>
    </span>
  );
};

const TimeSpanRow = ({
  className,
  label,
  resourceStates,
  timeSpan,
}: {
  className: string;
  label?: string;
  resourceStates: TranslatedApiChoice[];
  timeSpan?: TTimespan;
}): JSX.Element => (
  <tr className={className}>
    <td className="opening-hours-preview-table__day-column">{label}</td>
    <td
      className={`opening-hours-preview-table__time-span-column ${
        className ?? ''
      }`}>
      <TimeSpan resourceStates={resourceStates} timeSpan={timeSpan} />
    </td>
  </tr>
);

const OpeningHoursPreview = ({
  openingHours,
  resourceStates,
}: {
  openingHours: OpeningHours[];
  resourceStates: TranslatedApiChoice[];
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();

  return (
    <>
      {openingHoursToPreviewRows(openingHours).map(
        (previewRow, previewRowIdx) => (
          <table
            key={`preview-row-${previewRowIdx}`}
            className="opening-hours-preview-table">
            {previewRow.rule === 'week_every' ? null : (
              <caption className="opening-hours-preview-table__caption">
                {
                  uiFrequencyRules.find(
                    (rule) => rule.value === previewRow.rule
                  )?.label[language]
                }
              </caption>
            )}
            <thead className="opening-hours-preview-table__header hiddenFromScreen">
              <tr>
                <th
                  className="opening-hours-preview-table__day-column"
                  scope="col">
                  Päivä
                </th>
                <th
                  className="opening-hours-preview-table__time-span-column"
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
                                  language
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
    </>
  );
};

export default OpeningHoursPreview;
