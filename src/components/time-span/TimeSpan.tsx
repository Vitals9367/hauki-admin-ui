import { Checkbox, IconTrash, Select, TextInput, TimeInput } from 'hds-react';
import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import {
  InputOption,
  Language,
  ResourceState,
  TranslatedApiChoice,
  OpeningHoursTimeSpan,
} from '../../common/lib/types';
import { SupplementaryButton } from '../button/Button';
import './TimeSpan.scss';
import { useAppContext } from '../../App-context';
import { choiceToOption } from '../../common/utils/form/form';

const TimeSpan = ({
  disabled = false,
  groupLabel,
  item,
  resourceStates: apiResourceStates,
  namePrefix,
  onDelete,
}: {
  disabled?: boolean;
  groupLabel: string;
  item?: OpeningHoursTimeSpan;
  namePrefix: string;
  resourceStates: TranslatedApiChoice[];
  onDelete?: () => void;
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  const { control, register, watch } = useFormContext();
  const fullDay = watch(`${namePrefix}.full_day`);
  const resourceState = watch(`${namePrefix}.resource_state`);
  const resourceStates = apiResourceStates.map(choiceToOption(language));
  const sanitizedResourceStateOptions: InputOption[] = resourceStates.filter(
    ({ value }) => value !== 'undefined'
  );

  return (
    <div
      className={
        resourceState === ResourceState.OTHER
          ? 'time-span--with-extra-fields'
          : 'time-span'
      }
      role="group"
      aria-label={groupLabel}>
      <Controller
        defaultValue={item?.resource_state ?? ResourceState.OPEN}
        name={`${namePrefix}.resource_state`}
        control={control}
        render={({ onChange, value }): JSX.Element => (
          <Select<InputOption>
            disabled={disabled}
            id={`${namePrefix}-resource-state`}
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
      <Controller
        defaultValue={item?.full_day ?? false}
        render={(field): JSX.Element => (
          <div
            className={`time-span__full-day-checkbox-container ${
              resourceState === ResourceState.CLOSED
                ? 'time-span__full-day-checkbox-container--hidden'
                : ''
            }`}>
            <Checkbox
              className="time-span__full-day-checkbox"
              disabled={disabled}
              id={`${namePrefix}-full-day`}
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
      <div
        className={`time-span__range ${
          resourceState === ResourceState.CLOSED
            ? 'time-span__range--hidden'
            : ''
        }`}>
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id={`${namePrefix}-start-time`}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Alkaen"
          name={`${namePrefix}.start_time`}
          required
          value={item?.start_time || ''}
        />
        <div className="time-span__range-divider">-</div>
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id={`${namePrefix}-end-time`}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Päättyen"
          name={`${namePrefix}.end_time`}
          required
          value={item?.end_time || ''}
        />
      </div>
      {resourceState === ResourceState.OTHER && (
        <div className="time-span__descriptions">
          <TextInput
            id={`${namePrefix}-description-fi`}
            label="Kuvaus suomeksi"
            name={`${namePrefix}.description.fi`}
            ref={register()}
          />
          <TextInput
            id={`${namePrefix}-description-sv`}
            label="Kuvaus ruotsiksi"
            name={`${namePrefix}.description.sv`}
            ref={register()}
          />
          <TextInput
            id={`${namePrefix}-description-en`}
            label="Kuvaus englanniksi"
            name={`${namePrefix}.description.en`}
            ref={register()}
          />
        </div>
      )}
      <div className="remove-time-span-button">
        {onDelete && (
          <SupplementaryButton iconLeft={<IconTrash />} onClick={onDelete}>
            Poista rivi<span className="sr-only">{groupLabel}</span>
          </SupplementaryButton>
        )}
      </div>
    </div>
  );
};

export default TimeSpan;
