import { IconPlusCircle } from 'hds-react';
import React, { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  OpeningHoursFormValues,
  OpeningHoursTimeSpan,
  ResourceState,
  TranslatedApiChoice,
} from '../../common/lib/types';
import { getUiId } from '../../common/utils/form/form';
import { defaultTimeSpan } from '../../constants';
import { SupplementaryButton } from '../button/Button';
import TimeSpan from './TimeSpan';
import './TimeSpans.scss';

const TimeSpans = ({
  resourceStates,
  namePrefix,
}: {
  resourceStates: TranslatedApiChoice[];
  namePrefix: string;
}): JSX.Element => {
  const { control, watch } = useFormContext<OpeningHoursFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}`,
  });
  const ref = useRef<HTMLButtonElement>(null);
  const firstTimeSpanResourceState = watch(`${namePrefix}.[0].resource_state`);

  useEffect(() => {
    if (
      firstTimeSpanResourceState === ResourceState.CLOSED &&
      fields.length > 1
    ) {
      fields.forEach((field, i) => {
        if (i > 0) {
          remove(i);
        }
      });
    }
  }, [fields, firstTimeSpanResourceState, namePrefix, remove]);

  return (
    <div className="time-spans">
      {fields.map((field, i) => (
        <TimeSpan
          key={field.id}
          groupLabel={`Aukioloaika ${i + 1}`}
          item={field as OpeningHoursTimeSpan}
          resourceStates={resourceStates.filter((resourceState) =>
            i === 0 ? true : resourceState.value !== ResourceState.CLOSED
          )}
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
      {firstTimeSpanResourceState !== ResourceState.CLOSED && (
        <div>
          <SupplementaryButton
            dataTest={getUiId([namePrefix, 'add-time-span-button'])}
            ref={ref}
            className="add-time-span-button"
            iconLeft={<IconPlusCircle />}
            onClick={(): void => append(defaultTimeSpan)}
            type="button">
            Lisää aukiolomääritys
          </SupplementaryButton>
        </div>
      )}
    </div>
  );
};

export default TimeSpans;
