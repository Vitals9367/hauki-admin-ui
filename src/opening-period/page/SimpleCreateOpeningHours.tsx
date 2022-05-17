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
import { upperFirst } from 'lodash';
import {
  Language,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import {
  getWeekdayLongNameByIndexAndLang,
  getWeekdayShortNameByIndexAndLang,
} from '../../common/utils/date-time/format';
import { SecondaryButton } from '../../components/button/Button';
import Preview from './OpeningHoursPreview';
import './SimpleCreateOpeningHours.scss';
import {
  OpeningHoursFormState,
  OpeningHours as TOpeningHours,
  OpeningHoursTimeSpan as TOpeningHoursTimeSpan,
  OptionType,
} from './types';

type InflectLabels = {
  [language in Language]: {
    [x: number]: string;
  };
};

const languageGenitiveInflects: InflectLabels = {
  fi: {
    3: 'keskiviikon',
  },
  sv: {},
  en: {},
};

const DayCheckbox = ({
  currentDay,
  namePrefix,
  onChange,
  checked,
}: {
  currentDay: number;
  namePrefix: string;
  onChange: (checked: boolean) => void;
  checked?: boolean;
}): JSX.Element => {
  const id = `${namePrefix}-days-${currentDay}`;

  return (
    <label htmlFor={id} className="day-label">
      <input
        id={id}
        type="checkbox"
        onChange={(): void => {
          const newChecked = !checked;
          onChange(newChecked);
        }}
        checked={checked}
      />
      <span className="day-option">
        {getWeekdayShortNameByIndexAndLang({
          weekdayIndex: currentDay,
          language: Language.FI,
        })}
      </span>
    </label>
  );
};

const OpeningHoursTimeSpan = ({
  disabled = false,
  groupLabel,
  item,
  resourceStates,
  namePrefix,
  onDelete,
}: {
  disabled?: boolean;
  groupLabel: string;
  item?: TOpeningHoursTimeSpan;
  namePrefix: string;
  resourceStates: OptionType[];
  onDelete?: () => void;
}): JSX.Element => {
  const { control, register, watch } = useFormContext();
  const fullDay = watch(`${namePrefix}.fullDay`);
  const state = watch(`${namePrefix}.state`);
  const sanitizedResourceStateOptions: OptionType[] = resourceStates.filter(
    ({ value }) => value !== 'undefined'
  );

  return (
    <div
      className="opening-hours-and-details-container"
      role="group"
      aria-label={groupLabel}>
      <div className="opening-hours-time-span__range">
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id={`${namePrefix}-start`}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Alkaen"
          name={`${namePrefix}.start`}
          value={item?.start || '09:00'}
        />
        <div className="opening-hours-time-span__range-divider">-</div>
        <TimeInput
          ref={register()}
          disabled={disabled || fullDay}
          id={`${namePrefix}-endDate`}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Päättyen"
          name={`${namePrefix}.end`}
          value={item?.end || '20:00'}
        />
      </div>
      <div className="fullday-checkbox-container">
        <Controller
          defaultValue={item?.fullDay ?? false}
          render={(field): JSX.Element => (
            <Checkbox
              id={`${namePrefix}-fullDay`}
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
            id={`${namePrefix}-state`}
            label="Tila"
            options={sanitizedResourceStateOptions}
            className="opening-hours-state-select"
            onChange={(option: OptionType): void => onChange(option.value)}
            placeholder="Valitse"
            required
            value={sanitizedResourceStateOptions.find(
              (option) => option.value === value
            )}
          />
        )}
      />
      <div>
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Poista<span className="sr-only">{groupLabel}</span>
          </Button>
        )}
      </div>
      {state === ResourceState.OTHER && (
        <div className="opening-hours-time-span__description-container">
          <TextInput
            id={`${namePrefix}-description`}
            ref={register()}
            label="Kuvaus suomeksi"
            name={`${namePrefix}.description`}
          />
          <TextInput id="" label="Kuvaus ruotsiksi" />
          <TextInput id="" label="Kuvaus englanniksi" />
        </div>
      )}
    </div>
  );
};

const OpeningHoursTimeSpans = ({
  resourceStates,
  namePrefix,
}: {
  resourceStates: OptionType[];
  namePrefix: string;
}): JSX.Element => {
  const { control } = useFormContext<OpeningHoursFormState>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}`,
  });

  return (
    <>
      {fields.map((field, i) => (
        <OpeningHoursTimeSpan
          key={field.id}
          groupLabel={`aukiolomääritys ${i + 1}`}
          item={field as TOpeningHoursTimeSpan}
          resourceStates={resourceStates}
          namePrefix={`${namePrefix}[${i}]`}
          onDelete={i === 0 ? undefined : (): void => remove(i)}
        />
      ))}
      <div className="opening-hours-actions-container">
        <button
          className="link-button"
          onClick={(): void => append({})}
          type="button">
          + Lisää tarkennettu aukioloaika
        </button>
      </div>
    </>
  );
};

const isOnlySelectedDay = (day: number, days: number[]): boolean =>
  days.length === 1 && days[0] === day;

const OpeningHours = ({
  dropIn,
  item,
  resourceStates,
  namePrefix,
  onDayChange,
}: {
  dropIn: boolean;
  item: TOpeningHours;
  namePrefix: string;
  resourceStates: OptionType[];
  onDayChange: (day: number, checked: boolean) => void;
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
  const [removedDay, setRemovedDay] = React.useState<number | null>(null);
  const days = watch(`${namePrefix}.days`, []) as number[];
  const removedDayLabel = removedDay
    ? getWeekdayLongNameByIndexAndLang({
        weekdayIndex: removedDay,
        language: Language.FI,
      })
    : '';

  const groupDays = (daysToIterate: number[]): number[][] =>
    daysToIterate.sort().reduce((acc: number[][], day): number[][] => {
      const lastSet = acc.length > 0 ? acc[acc.length - 1] : [];
      if (lastSet.length === 0) {
        return [[day]];
      }
      if (lastSet && lastSet[lastSet.length - 1] + 1 === day) {
        return [...acc.slice(0, acc.length - 1), [...lastSet, day]];
      }
      return [...acc, [day]];
    }, []);

  const resolveDayTranslation = (day: number, useGenitive: boolean): string => {
    const language = Language.FI;
    const translatedDay = getWeekdayLongNameByIndexAndLang({
      weekdayIndex: day,
      language,
    });

    return useGenitive
      ? (languageGenitiveInflects[language] &&
          languageGenitiveInflects[language][day]) ||
          `${translatedDay}n`
      : translatedDay;
  };

  return (
    <div
      className={`opening-hours-container ${
        dropIn ? 'opening-hours-container--drop-in' : ''
      }`}>
      <div>
        <h3 className="opening-hours-container-title" role="status">
          {upperFirst(
            item.days.length === 1
              ? `${resolveDayTranslation(item.days[0], true)} aukioloajat`
              : `${groupDays(item.days)
                  .map((group) =>
                    group.length === 1
                      ? resolveDayTranslation(group[0], false)
                      : `${resolveDayTranslation(
                          group[0],
                          false
                        )}-${resolveDayTranslation(
                          group[group.length - 1],
                          false
                        )}`
                  )
                  .join(', ')} aukioloajat`
          )}
        </h3>
        <div id={`${namePrefix}-days`}>Päivä</div>
        <div className="weekdays-container">
          <div
            className="weekdays"
            role="group"
            aria-labelledby={`${namePrefix}-days`}>
            {removedDay && (
              <Notification
                key={removedDay}
                label={`${upperFirst(
                  removedDayLabel
                )}-päivä siirretty omaksi riviksi`}
                position="bottom-right"
                dismissible
                autoClose
                closeButtonLabelText="Sulje ilmoitus"
                onClose={(): void => setRemovedDay(null)}
                style={{ zIndex: 100 }}>
                {`Juuri poistettu ${removedDayLabel} siirrettiin omaksi rivikseen.`}
              </Notification>
            )}
            <Controller
              control={control}
              defaultValue={item.days ?? []}
              name={`${namePrefix}.days`}
              render={(): JSX.Element => (
                <>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <DayCheckbox
                      key={`${namePrefix}-${day}`}
                      checked={days.includes(day)}
                      currentDay={day}
                      namePrefix={namePrefix}
                      onChange={(checked): void => {
                        onDayChange(day, checked);
                        if (!isOnlySelectedDay(day, item.days) && !checked) {
                          setRemovedDay(day);
                        }
                      }}
                    />
                  ))}
                </>
              )}
            />
          </div>
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
                  theme={{
                    '--toggle-button-color': 'var(--color-coat-of-arms)',
                    '--toggle-button-hover-color':
                      'var(--color-coat-of-arms-dark)',
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      {open && (
        <OpeningHoursTimeSpans
          resourceStates={resourceStates}
          namePrefix={`${namePrefix}.timeSpans`}
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
          <OpeningHoursTimeSpans
            resourceStates={resourceStates}
            namePrefix={`${namePrefix}.alternating[${i}].timeSpans`}
          />
        </Fragment>
      ))}
      <div className="opening-hours-actions-container">
        <button
          className="link-button"
          onClick={(): void =>
            append({
              timeSpans: [
                {
                  start: '09:00',
                  end: '20:00',
                  fullDay: false,
                  state: ResourceState.OPEN,
                },
              ],
            })
          }
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

  const defaultValues: { openingHours: TOpeningHours[] } = {
    openingHours: [
      {
        days: [1, 2, 3, 4, 5],
        isOpen: true,
        timeSpans: [{}],
      },
      {
        days: [6],
        isOpen: false,
        timeSpans: [{}],
      },
      {
        days: [7],
        isOpen: false,
        timeSpans: [{}],
      },
    ],
  };

  const form = useForm<OpeningHoursFormState>({
    defaultValues,
    shouldUnregister: false,
  });

  const { control, getValues, setValue, watch } = form;
  const { insert, fields, remove } = useFieldArray<TOpeningHours>({
    control,
    name: 'openingHours',
  });
  const [dropInRow, setDropInRow] = useState<number | undefined>();

  const allDayAreUncheckedForRow = (idx: number): boolean => {
    const days = getValues(`openingHours[${idx}].days`) as number[];

    return days.length === 0;
  };

  const setDay = (i: number, day: number, checked: boolean): void => {
    const days = getValues(`openingHours[${i}].days`) as number[];
    if (checked) {
      setValue(`openingHours[${i}].days`, [...days, day]);
    } else {
      setValue(
        `openingHours[${i}].days`,
        days.filter((d) => d !== day)
      );
    }
  };

  const findPreviousChecked = (i: number, day: number): number =>
    fields.findIndex(
      (item, idx) =>
        idx !== i &&
        (getValues(`openingHours[${idx}].days`) as number[]).includes(day)
    );

  const addNewRow = (currIndex: number, day: number): void => {
    const newIdx = currIndex + 1;
    const values = { days: [day], isOpen: true, timeSpans: [{}] };
    insert(newIdx, values, false);
    // FIXME: For some reason the normal array won't get added in the insert
    setValue(`openingHours[${newIdx}]`, values);
    setDropInRow(newIdx);
  };

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
              <p className="opening-hour-forms-required-help-text">
                Kaikki kentät jotka ovat merkitty{' '}
                <span className="asterisk">*</span>:llä ovat pakollisia
              </p>
            </div>
            <div className="opening-hours-form">
              <section>
                {fields.map((field, i) => (
                  <OpeningHours
                    key={field.id}
                    dropIn={dropInRow === i}
                    item={field as TOpeningHours}
                    resourceStates={resourceStates}
                    namePrefix={`openingHours[${i}]`}
                    onDayChange={(day, checked): void => {
                      setDropInRow(undefined);
                      if (checked) {
                        setDay(i, day, true);
                        const prevId = findPreviousChecked(i, day);
                        if (prevId >= 0) {
                          setDay(prevId, day, false);
                          if (allDayAreUncheckedForRow(prevId)) {
                            remove(prevId);
                          }
                        }
                      } else {
                        const days = (getValues(
                          `openingHours[${i}].days`
                        ) as number[]).filter((d) => d !== day);
                        if (days.length) {
                          setValue(`openingHours[${i}].days`, days);
                          addNewRow(i, day);
                        }
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
