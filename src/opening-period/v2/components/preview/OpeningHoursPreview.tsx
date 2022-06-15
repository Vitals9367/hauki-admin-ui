import React from 'react';
import { TranslatedApiChoice } from '../../../../common/lib/types';
import OpeningHoursRows from '../../../../components/opening-hours-rows/OpeningHoursRows';
import { OpeningHours } from '../../types';
import './OpeningHoursPreview.scss';

const OpeningHoursPreview = ({
  openingHours,
  resourceStates,
  className,
}: {
  openingHours: OpeningHours[];
  resourceStates: TranslatedApiChoice[];
  className?: string;
}): JSX.Element => (
  <div
    aria-labelledby="opening-hours-preview"
    className={`card opening-hours-preview ${className || ''}`}
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    tabIndex={0}>
    <h2 id="opening-hours-preview" className="opening-hours-preview__title">
      Esikatselu
    </h2>
    <OpeningHoursRows
      openingHours={openingHours}
      resourceStates={resourceStates}
    />
  </div>
);

export default OpeningHoursPreview;
