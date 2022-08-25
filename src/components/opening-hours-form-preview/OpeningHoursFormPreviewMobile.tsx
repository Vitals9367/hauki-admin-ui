import { IconAngleDown, IconAngleUp, useAccordion } from 'hds-react';
import React, { useRef } from 'react';
import {
  DatePeriod,
  Language,
  TranslatedApiChoice,
} from '../../common/lib/types';
import { SupplementaryButton } from '../button/Button';
import useMobile from '../../hooks/useMobile';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import OpeningHoursFormPreview from './OpeningHoursFormPreview';
import './OpeningHoursFormPreviewMobile.scss';

type Props = {
  datePeriod: DatePeriod;
  language: Language;
  resourceStates: TranslatedApiChoice[];
};

const OpeningHoursFormPreviewMobile = ({
  datePeriod,
  resourceStates,
}: Props): JSX.Element => {
  const { isOpen, buttonProps, closeAccordion } = useAccordion({
    initiallyOpen: false,
  });
  const mobilePreview = useRef<HTMLDivElement>(null);
  useOnClickOutside(mobilePreview, closeAccordion);
  const isMobile = useMobile();

  return (
    <div ref={mobilePreview}>
      <SupplementaryButton
        className="opening-hours-preview-mobile-toggle"
        iconRight={
          isOpen ? <IconAngleUp aria-hidden /> : <IconAngleDown aria-hidden />
        }
        size={isMobile ? 'small' : 'default'}
        {...buttonProps}>
        Esikatselu
      </SupplementaryButton>
      <div
        aria-hidden={!isOpen}
        className={`opening-hours-preview-mobile ${
          isOpen
            ? 'opening-hours-preview-mobile--open'
            : 'opening-hours-preview-mobile--closed'
        }`}>
        <OpeningHoursFormPreview
          className="opening-hours-preview-mobile-preview"
          datePeriod={datePeriod}
          resourceStates={resourceStates}
          tabIndex={isMobile && isOpen ? 0 : -1}
        />
      </div>
    </div>
  );
};

export default OpeningHoursFormPreviewMobile;
