import React, { useState } from 'react';
import { RadioButton, SelectionGroup } from 'hds-react';
import { TranslatedApiChoice } from '../../common/lib/types';
import TimeSpans from '../time-span/TimeSpans';
import './ExceptionOpeningHoursFormInputs.scss';

const ExceptionOpeningHours = ({
  id,
  isOpen: isOpenInitially,
  onClose,
  onOpen,
  resourceStates,
}: {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  resourceStates: TranslatedApiChoice[];
}): JSX.Element => {
  const [isOpen, setOpen] = useState<boolean>(isOpenInitially);

  return (
    <>
      <SelectionGroup
        className="exception-opening-hours-resource-state-toggle"
        label="">
        <RadioButton
          id={`${id}-closed-state-checkbox`}
          name={`${id}-closed-state-checkbox`}
          checked={!isOpen}
          label="Suljettu koko päivän"
          onChange={(): void => {
            setOpen(false);
            onClose();
          }}
        />
        <RadioButton
          id={`${id}-open-state-checkbox`}
          name={`${id}-open-state-checkbox`}
          checked={isOpen}
          label="Voimassa tietyn ajan"
          onChange={(): void => {
            setOpen(true);
            onOpen();
          }}
        />
      </SelectionGroup>
      {isOpen && (
        <div className="exception-opening-hours-time-spans">
          <TimeSpans
            openingHoursIdx={0}
            resourceStates={resourceStates}
            timeSpanGroupIdx={0}
          />
        </div>
      )}
    </>
  );
};

export default ExceptionOpeningHours;
