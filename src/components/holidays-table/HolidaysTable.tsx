import React from 'react';
import { formatDate } from '../../common/utils/date-time/format';
import { getHolidays } from '../../services/holidays';
import OpeningPeriodAccordion from '../opening-period-accordion/OpeningPeriodAccordion';
import './HolidaysTable.scss';

const HolidaysTable = (): JSX.Element => {
  const holidays = getHolidays();
  return (
    <OpeningPeriodAccordion
      periodName="Juhlapyhien aukioloajat"
      dateRange={
        <>
          Seuraava juhlapyhä: <strong>{holidays[0].name}</strong> — Ei
          poikkeavia aukioloaikoja
        </>
      }
      editUrl="">
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
            <div className="holidays-table__row" role="row">
              <div
                className="holidays-table__cell holidays-table__cell--name"
                role="cell">
                {holiday.name}
              </div>
              <div
                className="holidays-table__cell holidays-table__cell--date"
                role="cell">
                {formatDate(holiday.start_date).substring(0, 6)}
              </div>
              <div
                className="holidays-table__cell holidays-table__cell--opening-hours"
                role="cell">
                Ei poikkeavia aukioloja
              </div>
            </div>
          ))}
        </div>
      </div>
    </OpeningPeriodAccordion>
  );
};

export default HolidaysTable;
