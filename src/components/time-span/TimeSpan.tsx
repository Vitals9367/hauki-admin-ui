import { Checkbox, IconTrash, Select, TextInput, TimeInput } from 'hds-react';
import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import {
  InputOption,
  Language,
  ResourceState,
  TranslatedApiChoice,
  TimeSpan as TTimespan,
  DatePeriod,
} from '../../common/lib/types';
import { SupplementaryButton } from '../button/Button';
import './TimeSpan.scss';
import { useAppContext } from '../../App-context';
import { choiceToOption, getUiId } from '../../common/utils/form/form';
import { isDescriptionAllowed } from '../../common/helpers/opening-hours-helpers';

const TimeSpan = ({
  disabled = false,
  groupLabel,
  i,
  item,
  onDelete,
  openingHoursIdx,
  resourceStates,
  timeSpanGroupIdx,
}: {
  disabled?: boolean;
  groupLabel: string;
  i: number;
  item?: TTimespan;
  onDelete?: () => void;
  openingHoursIdx: number;
  resourceStates: TranslatedApiChoice[];
  timeSpanGroupIdx: number;
}): JSX.Element => {
  const namePrefix = `openingHours.${openingHoursIdx}.timeSpanGroups.${timeSpanGroupIdx}.timeSpans.${i}` as const;
  const { language = Language.FI } = useAppContext();
  const { control, register, watch } = useFormContext<DatePeriod>();
  const fullDay = watch(`${namePrefix}.full_day`);
  const resourceState = watch(`${namePrefix}.resource_state`);
  const sanitizedResourceStateOptions = resourceStates
    .filter((elem) => {
      if (elem.value === ResourceState.UNDEFINED) {
        return false;
      }

      if (i > 0 && elem.value === ResourceState.NO_OPENING_HOURS) {
        return false;
      }
      return true;
    })
    .map(choiceToOption(language));

  const showTimeSpans =
    (resourceState !== ResourceState.NO_OPENING_HOURS &&
      resourceState !== ResourceState.CLOSED) ||
    i !== 0;

  return (
    <div
      className="time-span time-span--with-extra-fields"
      role="group"
      aria-label={groupLabel}>
      {showTimeSpans && (
        <>
          <div className="time-span__range">
            <TimeInput
              {...register(`${namePrefix}.start_time`)}
              disabled={disabled || fullDay}
              id={getUiId([namePrefix, 'start-time'])}
              hoursLabel="tunnit"
              minutesLabel="minuutit"
              label="Alkaen klo"
              required
              value={item?.start_time || ''}
            />
            <div className="time-span__range-divider">-</div>
            <TimeInput
              {...register(`${namePrefix}.end_time`)}
              disabled={disabled || fullDay}
              id={getUiId([namePrefix, 'end-time'])}
              hoursLabel="tunnit"
              minutesLabel="minuutit"
              label="Päättyen klo"
              required
              value={item?.end_time || ''}
            />
          </div>
          <Controller
            defaultValue={item?.full_day ?? false}
            render={({ field }): JSX.Element => (
              <div className="time-span__full-day-checkbox-container">
                <Checkbox
                  className="time-span__full-day-checkbox"
                  disabled={disabled}
                  id={getUiId([namePrefix, 'full-day'])}
                  name={`${namePrefix}.full_day`}
                  label="24 h"
                  onChange={(e): void => {
                    field.onChange(e.target.checked);
                  }}
                  checked={field.value}
                />
              </div>
            )}
            control={control}
            name={`${namePrefix}.full_day`}
          />
        </>
      )}
      <Controller
        defaultValue={item?.resource_state ?? ResourceState.OPEN}
        name={`${namePrefix}.resource_state`}
        control={control}
        render={({ field: { name, onChange, value } }): JSX.Element => (
          <Select<InputOption>
            disabled={disabled}
            id={getUiId([name])}
            label="Aukiolon tyyppi"
            options={sanitizedResourceStateOptions}
            className="time-span__resource-state-select"
            onChange={(option: InputOption): void => onChange(option.value)}
            placeholder="Valitse"
            required
            value={sanitizedResourceStateOptions.find(
              (option) => option.value === value
            )}
          />
        )}
      />
      {!resourceState ||
        (isDescriptionAllowed(resourceState) && (
          <>
            <div className="time-span__descriptions">
              <Controller
                defaultValue={item?.description.fi ?? ''}
                name={`${namePrefix}.description.fi`}
                render={({ field: { name, onChange, value } }): JSX.Element => (
                  <TextInput
                    id={getUiId([name])}
                    label="Kuvaus suomeksi"
                    onChange={onChange}
                    placeholder="Esim. seniorit"
                    value={value || ''}
                  />
                )}
              />
              <Controller
                defaultValue={item?.description.sv ?? ''}
                name={`${namePrefix}.description.sv`}
                render={({ field: { name, onChange, value } }): JSX.Element => (
                  <TextInput
                    id={getUiId([name])}
                    label="Kuvaus ruotsiksi"
                    onChange={onChange}
                    placeholder="T.ex. seniorer"
                    value={value || ''}
                  />
                )}
              />
              <Controller
                defaultValue={item?.description.en ?? ''}
                name={`${namePrefix}.description.en`}
                render={({ field: { name, onChange, value } }): JSX.Element => (
                  <TextInput
                    id={getUiId([name])}
                    label="Kuvaus englanniksi"
                    name={`${namePrefix}.description.en`}
                    onChange={onChange}
                    placeholder="E.g. seniors"
                    value={value || ''}
                  />
                )}
              />
            </div>
          </>
        ))}
      <div className="remove-time-span-button">
        {onDelete && (
          <SupplementaryButton iconLeft={<IconTrash />} onClick={onDelete}>
            Poista rivi<span className="hiddenFromScreen">{groupLabel}</span>
          </SupplementaryButton>
        )}
      </div>
    </div>
  );
};

export default TimeSpan;
