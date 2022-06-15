import React from 'react';
import {
  OpeningHours,
  TranslatedApiChoice,
} from '../../../../common/lib/types';
import OpeningHoursPreview from '../../../../components/opening-hours-preview/OpeningHoursPreview';
import './OpeningHoursFormPreview.scss';

const OpeningHoursFormPreview = ({
  openingHours,
  resourceStates,
  className,
}: {
  openingHours: OpeningHours[];
  resourceStates: TranslatedApiChoice[];
  className?: string;
}): JSX.Element => (
  <div
    aria-labelledby="opening-hours-form-preview"
    className={`card opening-hours-form-preview ${className || ''}`}
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    tabIndex={0}>
    <h2
      id="opening-hours-form-preview"
      className="opening-hours-form-preview__title">
      Esikatselu
    </h2>
    <OpeningHoursPreview
      openingHours={openingHours}
      resourceStates={resourceStates}
    />
  </div>
);

export default OpeningHoursFormPreview;
