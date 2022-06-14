import { IconAngleDown, IconAngleUp, useAccordion } from 'hds-react';
import React, { useRef } from 'react';
import { SupplementaryButton } from '../../../../components/button/Button';
import useOnClickOutside from '../../../../hooks/useOnClickOutside';
import { OpeningHours, OptionType } from '../../types';
import OpeningHoursPreview from './OpeningHoursPreview';
import './OpeningHoursPreviewMobile.scss';

type Props = {
  openingHours: OpeningHours[];
  resourceStates: OptionType[];
  rules: OptionType[];
};

const OpeningHoursPreviewMobile = ({
  openingHours,
  resourceStates,
  rules,
}: Props): JSX.Element => {
  const { isOpen, buttonProps, closeAccordion } = useAccordion({
    initiallyOpen: false,
  });
  const mobilePreview = useRef<HTMLDivElement>(null);
  useOnClickOutside(mobilePreview, closeAccordion);

  return (
    <div ref={mobilePreview}>
      <SupplementaryButton
        className="opening-hours-preview-mobile-toggle"
        iconRight={
          isOpen ? <IconAngleUp aria-hidden /> : <IconAngleDown aria-hidden />
        }
        {...buttonProps}>
        Esikatselu
      </SupplementaryButton>
      <div
        className={`opening-hours-preview-mobile ${
          isOpen
            ? 'opening-hours-preview-mobile--open'
            : 'opening-hours-preview-mobile--closed'
        }`}>
        <OpeningHoursPreview
          openingHours={openingHours}
          resourceStates={resourceStates}
          rules={rules}
          className="opening-hours-preview-mobile-preview"
        />
      </div>
    </div>
  );
};

export default OpeningHoursPreviewMobile;
