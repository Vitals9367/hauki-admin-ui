import React from 'react';
import { useAppContext } from '../../App-context';
import { isHoliday } from '../../common/helpers/opening-hours-helpers';
import {
  Holiday,
  DatePeriod,
  UiDatePeriodConfig,
  Language,
} from '../../common/lib/types';
import { formatDate } from '../../common/utils/date-time/format';
import ExceptionOpeningHours from '../exception-opening-hours/ExceptionOpeningHours';
import OpeningPeriodAccordion from '../opening-period-accordion/OpeningPeriodAccordion';
import './HolidaysTable.scss';

const HolidayOpeningHours = ({
  datePeriods,
  holiday,
  datePeriodConfig,
}: {
  datePeriodConfig?: UiDatePeriodConfig;
  datePeriods: DatePeriod[];
  holiday: Holiday;
}): JSX.Element => {
  const datePeriod = datePeriods.find((dp) => isHoliday(dp, [holiday]));

  if (datePeriod) {
    return (
      <ExceptionOpeningHours
        datePeriod={datePeriod}
        datePeriodConfig={datePeriodConfig}
      />
    );
  }

  return <>Ei poikkeavia aukioloja</>;
};

export const UpcomingHolidayNotification = ({
  datePeriodConfig,
  datePeriods,
  holiday,
}: {
  datePeriodConfig?: UiDatePeriodConfig;
  datePeriods: DatePeriod[];
  holiday: Holiday;
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  return (
    <div className="upcoming-holidays">
      <span>
        Seuraava juhlapyhä: <strong>{holiday.name[language]}</strong>
      </span>
      <span className="upcoming-holidays-divider">—</span>
      <HolidayOpeningHours
        datePeriodConfig={datePeriodConfig}
        datePeriods={datePeriods}
        holiday={holiday}
      />
    </div>
  );
};

const HolidaysTable = ({
  datePeriodConfig,
  datePeriods,
  holidays,
  initiallyOpen,
}: {
  datePeriodConfig?: UiDatePeriodConfig;
  datePeriods: DatePeriod[];
  holidays: Holiday[];
  initiallyOpen: boolean;
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  return (
    <OpeningPeriodAccordion
      initiallyOpen={initiallyOpen}
      id="holidays"
      periodName="Juhlapyhien aukioloajat"
      dateRange={
        <UpcomingHolidayNotification
          datePeriodConfig={datePeriodConfig}
          datePeriods={datePeriods}
          holiday={holidays[0]}
        />
      }>
      <div className="holidays-container">
        <h4 id="holidays-title" className="holidays-title">
          Seuraavat juhlapyhät
        </h4>
        <p id="holidays-description" className="holidays-description">
          Muista tarkistaa juhlapyhien aikataulut vuosittain – esimerkiksi
          pääsiäisen juhlapyhien ajankohta vaihtelee.
        </p>
      </div>
      <div
        className="holidays-table"
        role="table"
        aria-labelledby="holidays-title"
        aria-describedby="holidays-description">
        <div role="rowgroup">
          <div
            className="holidays-table__header holidays-table__row"
            role="row">
            <div className="holidays-table__header-cell" role="columnheader">
              Juhlapyhä
            </div>
            <div
              className="holidays-table__header-cell holidays-table__cell--date"
              role="columnheader">
              Päivämäärä
            </div>
            <div
              className="holidays-table__header-cell holidays-table__header-cell--opening-hours"
              role="columnheader">
              Aukiolo
            </div>
          </div>
        </div>
        <div role="rowgroup">
          {holidays.map((holiday) => (
            <div className="holidays-table__row" role="row" key={holiday.date}>
              <div
                className="holidays-table__cell holidays-table__cell--name"
                role="cell">
                {holiday.name[language]}
              </div>
              <div
                className="holidays-table__cell holidays-table__cell--date"
                role="cell">
                {formatDate(holiday.date)}
              </div>
              <div
                className="holidays-table__cell holidays-table__cell--opening-hours"
                role="cell">
                <HolidayOpeningHours
                  datePeriodConfig={datePeriodConfig}
                  datePeriods={datePeriods}
                  holiday={holiday}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </OpeningPeriodAccordion>
  );
};

export default HolidaysTable;
