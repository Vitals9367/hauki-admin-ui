import { IconAngleDown, IconAngleUp, useAccordion } from 'hds-react';
import React, { useRef } from 'react';
import {
  Language,
  OpeningHours,
  TranslatedApiChoice,
} from '../../common/lib/types';
import { SupplementaryButton } from '../button/Button';
import useMobile from '../../hooks/useMobile';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import OpeningHoursFormPreview from './OpeningHoursFormPreview';
import './OpeningHoursFormPreviewMobile.scss';

type Props = {
  language: Language;
  openingHours: OpeningHours[];
  resourceStates: TranslatedApiChoice[];
};

const OpeningHoursFormPreviewMobile = ({
  openingHours,
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
        className={`opening-hours-preview-mobile ${
          isOpen
            ? 'opening-hours-preview-mobile--open'
            : 'opening-hours-preview-mobile--closed'
        }`}>
        <OpeningHoursFormPreview
          className="opening-hours-preview-mobile-preview"
          openingHours={openingHours}
          resourceStates={resourceStates}
          tabIndex={isMobile && isOpen ? 0 : -1}
        />
      </div>
    </div>
  );
};

export default OpeningHoursFormPreviewMobile;
