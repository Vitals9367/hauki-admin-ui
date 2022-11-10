import { IconPlusCircle } from 'hds-react';
import React, { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { isDescriptionAllowed } from '../../common/helpers/opening-hours-helpers';
import {
  DatePeriod,
  ResourceState,
  TimeSpan as TTimeSpan,
  TranslatedApiChoice,
} from '../../common/lib/types';
import { getUiId } from '../../common/utils/form/form';
import { defaultTimeSpan } from '../../constants';
import { SupplementaryButton } from '../button/Button';
import TimeSpan from './TimeSpan';
import './TimeSpans.scss';

const shouldHideTimeSpan = (resourceState: ResourceState): boolean =>
  [ResourceState.CLOSED, ResourceState.NO_OPENING_HOURS].includes(
    resourceState
  );

const resetTimeSpan = (timeSpan: TTimeSpan): TTimeSpan => ({
  ...defaultTimeSpan,
  id: timeSpan.id,
  description:
    timeSpan.resource_state && isDescriptionAllowed(timeSpan.resource_state)
      ? timeSpan.description
      : defaultTimeSpan.description,
  resource_state: timeSpan.resource_state,
});

const TimeSpans = ({
  openingHoursIdx,
  resourceStates,
  timeSpanGroupIdx,
}: {
  openingHoursIdx: number;
  resourceStates: TranslatedApiChoice[];
  timeSpanGroupIdx: number;
}): JSX.Element => {
  const namePrefix = `openingHours.${openingHoursIdx}.timeSpanGroups.${timeSpanGroupIdx}.timeSpans` as const;
  const { control, getValues, setValue, watch } = useFormContext<DatePeriod>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: namePrefix,
  });
  const ref = useRef<HTMLButtonElement>(null);

  // Without this for some reason the key inference breaks :(
  const first = 0 as number;
  const firstTimeSpanKey = `${namePrefix}.${first}` as const;
  const firstTimeSpanResourceState = watch(
    `${firstTimeSpanKey}.resource_state`
  );
  const hideAddTimeSpan =
    !!firstTimeSpanResourceState &&
    shouldHideTimeSpan(firstTimeSpanResourceState);

  useEffect(() => {
    if (hideAddTimeSpan) {
      setValue(
        firstTimeSpanKey,
        resetTimeSpan(getValues(`${firstTimeSpanKey}`))
      );

      if (fields.length > 1) {
        fields.forEach((field, i) => {
          if (i > 0) {
            remove(i);
          }
        });
      }
    }
  }, [
    fields,
    firstTimeSpanResourceState,
    firstTimeSpanKey,
    hideAddTimeSpan,
    getValues,
    setValue,
    remove,
  ]);

  return (
    <div className="time-spans">
      {fields.map((field, i) => (
        <TimeSpan
          key={field.id}
          openingHoursIdx={openingHoursIdx}
          timeSpanGroupIdx={timeSpanGroupIdx}
          i={i}
          groupLabel={`Aukioloaika ${i + 1}`}
          item={field}
          resourceStates={resourceStates}
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
      {!hideAddTimeSpan && (
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
