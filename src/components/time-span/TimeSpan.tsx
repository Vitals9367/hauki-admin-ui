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
import { choiceToOption, getUiId } from '../../common/utils/form/form';

const TimeSpan = ({
  disabled = false,
  groupLabel,
  item,
  resourceStates,
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
  const resourceStateOptions = resourceStates.map(choiceToOption(language));
  const sanitizedResourceStateOptions: InputOption[] = resourceStateOptions.filter(
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
        render={({ name, onChange, value }): JSX.Element => (
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
      <div
        className={`time-span__range ${
          resourceState === ResourceState.CLOSED
            ? 'time-span__range--hidden'
            : ''
        }`}>
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id={getUiId([namePrefix, 'start-time'])}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Alkaen klo"
          name={`${namePrefix}.start_time`}
          required
          value={item?.start_time || ''}
        />
        <div className="time-span__range-divider">-</div>
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id={getUiId([namePrefix, 'end-time'])}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Päättyen klo"
          name={`${namePrefix}.end_time`}
          required
          value={item?.end_time || ''}
        />
      </div>
      {resourceState === ResourceState.OTHER && (
        <div className="time-span__descriptions">
          <Controller
            defaultValue={item?.description.fi ?? ''}
            name={`${namePrefix}.description.fi`}
            render={({ name, onChange, value }): JSX.Element => (
              <TextInput
                id={getUiId([name])}
                label="Kuvaus suomeksi"
                onChange={onChange}
                value={value}
              />
            )}
          />
          <Controller
            defaultValue={item?.description.sv ?? ''}
            name={`${namePrefix}.description.sv`}
            render={({ name, onChange, value }): JSX.Element => (
              <TextInput
                id={getUiId([name])}
                label="Kuvaus ruotsiksi"
                onChange={onChange}
                value={value}
              />
            )}
          />
          <Controller
            defaultValue={item?.description.en ?? ''}
            name={`${namePrefix}.description.en`}
            render={({ name, onChange, value }): JSX.Element => (
              <TextInput
                id={getUiId([name])}
                label="Kuvaus englanniksi"
                name={`${namePrefix}.description.en`}
                onChange={onChange}
                value={value}
              />
            )}
          />
        </div>
      )}
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
