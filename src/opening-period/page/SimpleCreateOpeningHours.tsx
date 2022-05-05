/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  Button,
  Checkbox,
  Notification,
  Select,
  TextInput,
  TimeInput,
  ToggleButton,
} from 'hds-react';
import React, { Fragment, useEffect, useState } from 'react';
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
import { daysOrder } from './constants';
import Preview from './OpeningHoursPreview';
import './SimpleCreateOpeningHours.scss';
import {
  Days,
  OptionType,
  OpeningHoursFormState,
  OpeningHoursRange,
  OpeningHours as TOpeningHours,
  OpeningHoursTimeSpan as TOpeningHoursTimeSpan,
} from './types';

const DayCheckbox = ({
  currentDay,
  namePrefix,
  onChange: onChangeOuter,
  checked,
}: {
  currentDay: string;
  namePrefix: string;
  onChange: (checked: boolean) => void;
  checked?: boolean;
}): JSX.Element => {
  const id = `${namePrefix}.days.${currentDay}`;
  const { control } = useFormContext<OpeningHoursFormState>();

  return (
    <Controller
      control={control}
      defaultValue={checked ?? false}
      name={`${namePrefix}.days.${currentDay}`}
      render={({ onChange, value, ref }): JSX.Element => (
        <label htmlFor={id} className="day-label">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            onChange={(): void => {
              const newChecked = !value;
              onChange(newChecked);
              onChangeOuter(newChecked);
            }}
            checked={value}
          />
          <span className="day-option">{currentDay}</span>
        </label>
      )}
    />
  );
};

const OpeningHoursTimeSpan = ({
  disabled = false,
  item,
  resourceStates,
  namePrefix,
}: {
  disabled?: boolean;
  item?: TOpeningHoursTimeSpan;
  namePrefix: string;
  resourceStates: OptionType[];
}): JSX.Element => {
  const { control, register, watch } = useFormContext();
  const fullDay = watch(`${namePrefix}.fullDay`);
  const state = watch(`${namePrefix}.state`);

  return (
    <div className="opening-hours-time-span">
      <div className="opening-hours-time-span__range">
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id="startDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Avataan"
          name={`${namePrefix}.start`}
          value={item?.start || '09:00'}
        />
        <div className="opening-hours-time-span__range-divider">-</div>
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id="endDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Suljetaan"
          name={`${namePrefix}.end`}
          value={item?.end || '20:00'}
        />
      </div>
      <div className="fullday-checkbox-container">
        <Controller
          defaultValue={item?.fullDay ?? false}
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
        defaultValue={item?.state ?? ResourceState.OPEN}
        name={`${namePrefix}.state`}
        control={control}
        render={({ onChange, value }): JSX.Element => (
          <Select<OptionType>
            disabled={disabled}
            label="Tila"
            options={resourceStates}
            className="opening-hours-state-select"
            onChange={(option: OptionType): void => onChange(option.value)}
            placeholder="Valitse"
            required
            value={resourceStates.find((option) => option.value === value)}
          />
        )}
      />
      {state === ResourceState.OTHER && (
        <TextInput id="" ref={register()} name={`${namePrefix}.description`} />
      )}
    </div>
  );
};

const OpeningHoursTimeSpanAndDetails = ({
  item,
  resourceStates,
  namePrefix,
}: {
  item?: TOpeningHours;
  resourceStates: OptionType[];
  namePrefix: string;
}): JSX.Element => {
  const { control } = useFormContext<OpeningHoursFormState>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}.details`,
  });

  return (
    <>
      <OpeningHoursTimeSpan
        item={item?.normal}
        resourceStates={resourceStates}
        namePrefix={`${namePrefix}.normal`}
      />
      {fields.map((field, i) => (
        <div key={field.id} className="opening-hours-time-span-details">
          <OpeningHoursTimeSpan
            item={field as TOpeningHoursTimeSpan}
            resourceStates={resourceStates}
            namePrefix={`${namePrefix}.details[${i}]`}
          />
          <Button variant="danger" onClick={(): void => remove(i)}>
            Poista
          </Button>
        </div>
      ))}
      <div>
        <button
          className="link-button"
          onClick={(): void =>
            append({
              start: '09:00',
              end: '20:00',
              fullDay: false,
              state: ResourceState.OPEN,
            })
          }
          type="button">
          + Lisää tarkennettu aukioloaika
        </button>
      </div>
    </>
  );
};

const isOnlySelectedDay = (day: string, days: Days): boolean => {
  const selectedDays = Object.entries(days)
    .filter((dayData: [string, boolean]) => dayData[1])
    .map((dayData: [string, boolean]) => dayData[0]);

  return selectedDays.length === 1 && selectedDays[0] === day;
};

type DefaultValues = {
  startTime: string;
  endTime: string;
  fullDay: boolean;
  state: ResourceState;
};

const OpeningHours = ({
  item,
  resourceStates,
  namePrefix,
  onDayChange,
}: {
  item: OpeningHoursRange;
  namePrefix: string;
  resourceStates: OptionType[];
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
    name: `${namePrefix}.alternating`,
  });
  const [removedDay, setRemovedDay] = React.useState<string | null>(null);

  return (
    <div className="opening-hours-container">
      <div>
        <div>Päivä</div>
        <div className="weekdays">
          {removedDay && (
            <Notification
              key={removedDay}
              label={`${removedDay}-päivä siirretty omaksi riviksi`}
              position="bottom-right"
              dismissible
              autoClose
              closeButtonLabelText="Sulje ilmoitus"
              onClose={(): void => setRemovedDay(null)}
              style={{ zIndex: 100 }}>
              {`Juuri poistettu ${removedDay} siirrettiin omaksi rivikseen.`}
            </Notification>
          )}
          {daysOrder.map((day) => (
            <DayCheckbox
              key={`${namePrefix}-${day}`}
              checked={item.days[day as keyof Days]}
              currentDay={day}
              namePrefix={namePrefix}
              onChange={(checked): void => {
                onDayChange(day as keyof Days, checked);
                if (!isOnlySelectedDay(day, item.days) && !checked) {
                  setRemovedDay(day);
                }
              }}
            />
          ))}
          <div className="weekdays-state-toggle">
            <Controller
              control={control}
              defaultValue={item.isOpen ?? true}
              name={`${namePrefix}.isOpen`}
              render={({ onChange, value }): JSX.Element => (
                <ToggleButton
                  id={`${namePrefix}-isOpen`}
                  label="Auki"
                  onChange={(): void => onChange(!value)}
                  checked={value}
                />
              )}
            />
          </div>
        </div>
      </div>
      {open && (
        <OpeningHoursTimeSpanAndDetails
          item={item.openingHours as TOpeningHours}
          resourceStates={resourceStates}
          namePrefix={`${namePrefix}.openingHours`}
        />
      )}
      {fields.map((field, i) => (
        <Fragment key={field.id}>
          <div className="alternating-opening-hour-container">
            <Controller
              defaultValue={options[0]}
              name={`${namePrefix}.alternating[${i}].rule`}
              control={control}
              render={({ onChange, value }): JSX.Element => (
                <Select<OptionType>
                  className="alternating-opening-hours-select"
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
            <Button variant="danger" onClick={(): void => remove(i)}>
              Poista
            </Button>
          </div>
          <div>
            <OpeningHoursTimeSpanAndDetails
              item={field as TOpeningHours}
              resourceStates={resourceStates}
              namePrefix={`${namePrefix}.alternating[${i}]`}
            />
          </div>
        </Fragment>
      ))}
      <button
        className="link-button"
        onClick={(): void =>
          append({
            normal: {
              start: '09:00',
              end: '20:00',
              fullDay: false,
              state: ResourceState.OPEN,
            },
          })
        }
        type="button">
        + Lisää vuorotteleva aukioloaika
      </button>
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

  const defaultValues: { openingHours: OpeningHoursRange[] } = {
    openingHours: [
      {
        days: {
          Ma: true,
          Ti: true,
          Ke: true,
          To: true,
          Pe: true,
          La: false,
          Su: false,
        },
      },
      {
        days: {
          Ma: false,
          Ti: false,
          Ke: false,
          To: false,
          Pe: false,
          La: true,
          Su: false,
        },
        isOpen: false,
      },
      {
        days: {
          Ma: false,
          Ti: false,
          Ke: false,
          To: false,
          Pe: false,
          La: false,
          Su: true,
        },
        isOpen: false,
      },
    ],
  };

  const form = useForm<OpeningHoursFormState>({
    defaultValues,
    shouldUnregister: false,
  });

  const { control, getValues, setValue, watch } = form;
  const { insert, fields, remove } = useFieldArray<OpeningHoursRange>({
    control,
    name: 'openingHours',
  });

  const allDayAreUncheckedForRow = (idx: number): boolean =>
    daysOrder.every((day) => !getValues(`openingHours[${idx}].days.${day}`));

  const setDay = (i: number, day: keyof Days, checked: boolean): void =>
    setValue(`openingHours[${i}].days.${day}`, checked);

  const findPreviousChecked = (i: number, day: keyof Days): number =>
    fields.findIndex(
      (item, idx) => idx !== i && getValues(`openingHours[${idx}].days.${day}`)
    );

  const addNewRow = (i: number, day: keyof Days): void =>
    insert(
      i + 1,
      {
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
      },
      false
    );

  const { openingHours } = watch();

  return (
    (resource && datePeriodConfig && (
      <FormProvider {...form}>
        <div className="opening-hours-page">
          <div>
            <div className="opening-hours-page__title">
              <h1 data-test="resource-info" className="resource-info-title">
                {resource?.name?.fi}
              </h1>
              <span>Osoite: {resource?.address.fi}</span>
            </div>
            <div className="opening-hours-form">
              <section>
                {fields.map((field, i) => (
                  <OpeningHours
                    key={field.id}
                    item={field as OpeningHoursRange}
                    resourceStates={resourceStates}
                    namePrefix={`openingHours[${i}]`}
                    onDayChange={(day, checked): void => {
                      if (checked) {
                        const prevId = findPreviousChecked(i, day);
                        if (prevId >= 0) {
                          setDay(prevId, day, false);
                          if (allDayAreUncheckedForRow(prevId)) {
                            remove(prevId);
                          }
                        }
                      } else if (allDayAreUncheckedForRow(i)) {
                        setDay(i, day, true);
                      } else {
                        addNewRow(i, day);
                      }
                    }}
                  />
                ))}
              </section>
              <div className="opening-hours-page__actions">
                <Button onClick={returnToResourcePage}>Tallenna</Button>
                <SecondaryButton onClick={returnToResourcePage}>
                  Peruuta
                </SecondaryButton>
              </div>
            </div>
          </div>
          <Preview
            openingHours={openingHours}
            resourceStates={resourceStates}
          />
        </div>
      </FormProvider>
    )) || <h1>Ladataan...</h1>
  );
};
