import React from 'react';
import { DatePeriod, TranslatedApiChoice } from '../../common/lib/types';
import { formatDateRange } from '../../common/utils/date-time/format';
import OpeningHoursPreview from '../opening-hours-preview/OpeningHoursPreview';
import './OpeningHoursFormPreview.scss';

const OpeningHoursFormPreview = ({
  datePeriod,
  resourceStates,
  className,
  tabIndex,
}: {
  datePeriod: DatePeriod;

  resourceStates: TranslatedApiChoice[];
  tabIndex?: number;
  className?: string;
}): JSX.Element => (
  <div
    aria-labelledby="opening-hours-form-preview"
    className={`card opening-hours-form-preview ${className || ''}`}
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    tabIndex={tabIndex}>
    <h2
      id="opening-hours-form-preview"
      className="opening-hours-form-preview__title">
      Esikatselu
    </h2>
    <p>{formatDateRange(datePeriod)}</p>
    <OpeningHoursPreview
      openingHours={datePeriod.openingHours}
      resourceStates={resourceStates}
    />
  </div>
);

export default OpeningHoursFormPreview;
