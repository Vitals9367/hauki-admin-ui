import { Button, Checkbox, Select, TextInput, TimeInput } from 'hds-react';
import React, { useEffect, useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import {
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import { SecondaryButton } from '../../components/button/Button';
import Preview from './OpeningHoursRangePreview';
import './SimpleCreateOpeningHours.scss';
import './SimpleCreateOpeningHours2.scss';
import { Days, OptionType, OpeningHoursFormState } from './types';

const DayCheckbox = ({
  children,
  namePrefix,
  onChange: onChangeOuter,
  checked,
}: {
  children: string;
  namePrefix: string;
  onChange: (checked: boolean) => void;
  checked: boolean;
}): JSX.Element => {
  const id = `${namePrefix}.days.${children}`;
  const { control } = useFormContext<OpeningHoursFormState>();

  return (
    <Controller
      control={control}
      defaultValue={checked}
      name={`${namePrefix}.days.${children}`}
      render={({ onChange, value }): JSX.Element => (
        <label htmlFor={id} className="day-label">
          <input
            id={id}
            type="checkbox"
            onChange={(): void => {
              onChange(!value);
              onChangeOuter(!value);
            }}
            checked={value}
          />
          <span className="day-option">{children}</span>
        </label>
      )}
    />
  );
};

const SwitchButton = ({
  isActive,
  label,
  onChange,
}: {
  isActive: boolean;
  label: string;
  onChange: () => void;
}): JSX.Element => (
  <Button
    className={`switch-buttons-button ${
      isActive ? 'switch-buttons-button--active' : ''
    }`}
    variant="secondary"
    onClick={(): void => onChange()}>
    {label}
  </Button>
);

const SwitchButtons = ({
  labels,
  value,
  onChange,
}: {
  labels: { on: string; off: string };
  value: boolean;
  onChange: (x: boolean) => void;
}): JSX.Element => (
  <div className="switch-buttons">
    <SwitchButton
      isActive={value}
      label={labels.on}
      onChange={(): void => onChange(true)}
    />
    <span className="switch-buttons-divider">/</span>
    <SwitchButton
      isActive={!value}
      label={labels.off}
      onChange={(): void => onChange(false)}
    />
  </div>
);

const OpeningHoursRangeTimeSpan = ({
  defaultValues,
  disabled = false,
  resourceStates,
  namePrefix,
}: {
  defaultValues?: {
    startTime: string;
    endTime: string;
    state: ResourceState;
  };
  disabled?: boolean;
  namePrefix: string;
  resourceStates: OptionType[];
}): JSX.Element => {
  const { control, register, watch } = useFormContext();
  const fullDay = watch(`${namePrefix}.fullDay`);
  const state = watch(`${namePrefix}.state`);

  return (
    <div className="opening-hours-range__time-span">
      <div className="opening-hours-range__time-span-inputs">
        <TimeInput
          ref={register}
          disabled={disabled || fullDay}
          id="startDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Avataan"
          name={`${namePrefix}.start`}
          value={defaultValues?.startTime}
        />
        <div>-</div>
        <TimeInput
          ref={register}
          disabled={disabled || fullDay}
          id="endDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Suljetaan"
          name={`${namePrefix}.end`}
          value={defaultValues?.endTime}
        />
      </div>
      <div className="fullday-checkbox-container">
        <Controller
          defaultValue={false}
          render={(field): JSX.Element => (
            <Checkbox
              id={`${namePrefix}.fullDay`}
              name={`${namePrefix}.fullDay`}
              label="24 h"
              onChange={(e): void => {
                field.onChange(e.target.checked);
              }}
              checked={field.value}
            />
          )}
          control={control}
          name={`${namePrefix}.fullDay`}
        />
      </div>
      <Controller
        defaultValue={resourceStates[0]}
        name={`${namePrefix}.state`}
        control={control}
        render={({ onChange, value }): JSX.Element => (
          <Select<OptionType>
            disabled={disabled}
            label="Tila"
            options={resourceStates}
            className="opening-hours-range-select"
            onChange={onChange}
            placeholder="Valitse"
            required
            value={value}
          />
        )}
      />
      {state?.value === ResourceState.OTHER && (
        <TextInput id="" ref={register()} name={`${namePrefix}.description`} />
      )}
    </div>
  );
};

const OpeningHoursRangeSelections = ({
  defaultValues,
  resourceStates,
  namePrefix,
}: {
  defaultValues?: DefaultValues;
  resourceStates: OptionType[];
  namePrefix: string;
}): JSX.Element => {
  const { control } = useFormContext<OpeningHoursFormState>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exceptions',
  });

  return (
    <div>
      <div className="opening-hours-range__selections">
        <div className="opening-hours-range__time-spans">
          <div className="opening-hours__time-span-container">
            <OpeningHoursRangeTimeSpan
              defaultValues={defaultValues}
              resourceStates={resourceStates}
              namePrefix={`${namePrefix}.normal`}
            />
          </div>
          {fields.map((a, i) => (
            <div className="exception" key={a.id}>
              <OpeningHoursRangeTimeSpan
                defaultValues={defaultValues}
                resourceStates={resourceStates}
                namePrefix={`${namePrefix}.exceptions[${i}]`}
              />
              <Button variant="danger" onClick={(): void => remove(i)}>
                Poista
              </Button>
            </div>
          ))}
          <div>
            <button
              className="link-button"
              onClick={(): void => append({})}
              type="button">
              + Lisää tarkennettu aukioloaika
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type DefaultValues = {
  startTime: string;
  endTime: string;
  state: ResourceState;
};

const daysOrder = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

const OpeningHoursRange = ({
  resourceStates,
  defaultValues,
  namePrefix,
  onDayChange,
  days,
}: {
  defaultIOpen?: boolean;
  days: Days;
  namePrefix: string;
  resourceStates: OptionType[];
  defaultValues?: DefaultValues;
  onDayChange: (day: keyof Days, checked: boolean) => void;
}): JSX.Element => {
  const options = [
    { value: '0', label: 'Joka toinen viikko' },
    { value: '1', label: 'Joka kolmas viikko' },
    { value: '2', label: 'Joka neljäs viikko' },
  ];
  const { control, watch } = useFormContext<OpeningHoursFormState>();
  const open = watch(`${namePrefix}.isOpen`);
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'variable',
  });

  return (
    <div className="opening-hours-range-container">
      <div className="weekdays">
        <div>Päivä</div>
        <div className="weekdays-and-is-open-selector">
          {daysOrder.map((day) => (
            <DayCheckbox
              key={`${namePrefix}-${day}`}
              checked={days[day as keyof Days]}
              namePrefix={namePrefix}
              onChange={(checked): void =>
                onDayChange(day as keyof Days, checked)
              }>
              {day}
            </DayCheckbox>
          ))}
          <Controller
            defaultValue
            name={`${namePrefix}.isOpen`}
            render={({ onChange, value }): JSX.Element => (
              <SwitchButtons
                labels={{ on: 'Auki', off: 'Kiinni' }}
                onChange={onChange}
                value={value}
              />
            )}
          />
        </div>
      </div>
      {open && (
        <div className="opening-hours-range">
          <OpeningHoursRangeSelections
            defaultValues={defaultValues}
            resourceStates={resourceStates}
            namePrefix={`${namePrefix}.normal`}
          />
        </div>
      )}
      {fields.map((field, i) => (
        <div key={field.id}>
          <div className="container varying-opening-hour">
            <Controller
              defaultValue={options[0]}
              name={`${namePrefix}.variable[${i}].rule`}
              control={control}
              render={({ onChange, value }): JSX.Element => (
                <Select<OptionType>
                  className="variable-opening-hours-select"
                  defaultValue={options[0]}
                  label="Toistuvuus"
                  onChange={onChange}
                  options={options}
                  placeholder="Valitse"
                  required
                  value={value}
                />
              )}
            />
            <Button variant="danger" onClick={() => remove(i)}>
              Poista
            </Button>
          </div>
          <div className="opening-hours-range">
            <OpeningHoursRangeSelections
              defaultValues={defaultValues}
              resourceStates={resourceStates}
              namePrefix={`${namePrefix}.variable[${i}]`}
            />
          </div>
        </div>
      ))}
      <div className="container">
        <button
          className="link-button"
          onClick={() => append({})}
          type="button">
          + Lisää vuorotteleva aukioloaika
        </button>
      </div>
    </div>
  );
};

export default ({ resourceId }: { resourceId: string }): JSX.Element => {
  const [resource, setResource] = useState<Resource>();
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const history = useHistory();
  const returnToResourcePage = (): void =>
    history.push(`/resource/${resourceId}`);

  let resourceStates = datePeriodConfig
    ? datePeriodConfig.resourceState.options.map((translatedApiChoice) => ({
        value: translatedApiChoice.value,
        label: translatedApiChoice.label.fi,
      }))
    : [];

  resourceStates = [
    ...resourceStates,
    // TODO: This needs to be returned from the server
    {
      label: 'Muu, mikä?',
      value: ResourceState.OTHER,
    },
  ];

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const [apiResource, uiDatePeriodOptions] = await Promise.all([
          api.getResource(resourceId),
          api.getDatePeriodFormConfig(),
        ]);
        setResource(apiResource);
        setDatePeriodConfig(uiDatePeriodOptions);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Add date-period - data initialization error:', e);
      }
    };

    fetchData();
  }, [resourceId]);

  const defaultState = {
    openingHours: [
      {
        days: {
          Ma: true,
          Ti: true,
          Ke: true,
          To: true,
          Pe: true,
          La: true,
          Su: true,
        },
        isOpen: true,
        normal: {
          exceptions: [],
        },
        variable: [],
      },
    ],
  };

  const form = useForm<OpeningHoursFormState>({
    defaultValues: defaultState,
  });
  const { control, getValues, setValue, watch } = form;
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'openingHours',
  });

  const allDayAreUncheckedForRow = (idx: number): boolean =>
    daysOrder.every((day) => !getValues(`openingHours[${idx}].days.${day}`));

  const setDay = (i: number, day: keyof Days, checked: boolean): void =>
    setValue(`openingHours[${i}].days.${day}`, checked);

  const values = watch();

  return (
    (resource && datePeriodConfig && (
      <FormProvider {...form}>
        <div className="opening-hours-form-section">
          <div>
            <div className="opening-hours-form__title">
              <h1 data-test="resource-info" className="resource-info-title">
                {resource?.name?.fi}
              </h1>
              <span>Osoite: {resource?.address.fi}</span>
            </div>
            <div className="opening-hours-form">
              <section>
                {fields.map((field, i) => (
                  <OpeningHoursRange
                    key={field.id}
                    resourceStates={resourceStates}
                    days={field.days}
                    namePrefix={`openingHours[${i}]`}
                    onDayChange={(day, checked): void => {
                      if (checked) {
                        const prevId = fields.findIndex(
                          (item, idx) =>
                            idx !== i &&
                            getValues(`openingHours[${idx}].days.${day}`)
                        );
                        if (prevId >= 0) {
                          setDay(prevId, day, false);

                          if (allDayAreUncheckedForRow(prevId)) {
                            remove(prevId);
                          }
                        }
                        return;
                      }

                      if (allDayAreUncheckedForRow(i)) {
                        if (i > 0) {
                          setDay(i - 1, day, true);
                        } else {
                          setDay(i + 1, day, true);
                        }
                        remove(i);
                        return;
                      }

                      if (fields.length - 1 === i) {
                        append({
                          ...defaultState,
                          days: {
                            Ma: false,
                            Ti: false,
                            Ke: false,
                            To: false,
                            Pe: false,
                            La: false,
                            Su: false,
                            [day]: true,
                          },
                        });
                        return;
                      }

                      setDay(i + 1, day, true);
                    }}
                    defaultValues={{
                      startTime: '09:00',
                      endTime: '20:00',
                      state: ResourceState.OPEN,
                    }}
                  />
                ))}
              </section>
              <div className="opening-hours-form__buttons">
                <Button onClick={returnToResourcePage}>Tallenna</Button>
                <SecondaryButton onClick={returnToResourcePage}>
                  Peruuta
                </SecondaryButton>
              </div>
            </div>
          </div>
          <Preview data={values} />
        </div>
      </FormProvider>
    )) || <h1>Ladataan...</h1>
  );
};
