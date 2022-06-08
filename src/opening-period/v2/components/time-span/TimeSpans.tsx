import { IconPlusCircle } from 'hds-react';
import React, { useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SupplementaryButton } from '../../../../components/button/Button';
import {
  OpeningHoursFormValues,
  OpeningHoursTimeSpan,
  OptionType,
} from '../../types';
import TimeSpan from './TimeSpan';
import './TimeSpans.scss';

const TimeSpans = ({
  resourceStates,
  namePrefix,
}: {
  resourceStates: OptionType[];
  namePrefix: string;
}): JSX.Element => {
  const { control } = useFormContext<OpeningHoursFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}`,
  });
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      {fields.map((field, i) => (
        <TimeSpan
          key={field.id}
          groupLabel={`aukiolomääritys ${i + 1}`}
          item={field as OpeningHoursTimeSpan}
          resourceStates={resourceStates}
          namePrefix={`${namePrefix}[${i}]`}
          onDelete={
            i === 0
              ? undefined
              : (): void => {
                  // eslint-disable-next-line no-unused-expressions
                  ref.current?.focus();
                  remove(i);
                }
          }
        />
      ))}
      <div className="opening-hours-actions-container">
        <SupplementaryButton
          ref={ref}
          className="add-time-span-button"
          iconLeft={<IconPlusCircle />}
          onClick={(): void => append({})}
          type="button">
          <span>Lisää aukiolomääritys</span>
        </SupplementaryButton>
      </div>
    </>
  );
};

export default TimeSpans;
