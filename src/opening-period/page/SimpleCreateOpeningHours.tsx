/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  Button,
  Checkbox,
  Notification,
  Select,
  TextInput,
  TimeInput,
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
  DatePeriod,
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
import { PrimaryButton, SecondaryButton } from '../../components/button/Button';
import Preview from './OpeningHoursPreview';
import './SimpleCreateOpeningHours.scss';
import {
  OpeningHours as TOpeningHours,
  OpeningHoursTimeSpan as TOpeningHoursTimeSpan,
  OptionType,
} from './types';
import { openingHoursToApiDatePeriod } from './form-helpers';

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

type OpeningHoursFormState = {
  openingHours: TOpeningHours[];
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
  const id = `${namePrefix}-weekdays-${currentDay}`;

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
  const fullDay = watch(`${namePrefix}.full_day`);
  const resourceState = watch(`${namePrefix}.resource_state`);
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
          id={`${namePrefix}-start-time`}
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          label="Alkaen"
          name={`${namePrefix}.start_time`}
          required
          value={item?.start_time || ''}
        />
        <div className="opening-hours-time-span__range-divider">-</div>
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
      <div className="fullday-checkbox-container">
        <Controller
          defaultValue={item?.full_day ?? false}
          render={(field): JSX.Element => (
            <Checkbox
              id={`${namePrefix}-full-day`}
              name={`${namePrefix}.full_day`}
              label="24 h"
              onChange={(e): void => {
                field.onChange(e.target.checked);
              }}
              checked={field.value}
            />
          )}
          control={control}
          name={`${namePrefix}.full_day`}
        />
      </div>
      <Controller
        defaultValue={item?.resource_state ?? ResourceState.OPEN}
        name={`${namePrefix}.resource_state`}
        control={control}
        render={({ onChange, value }): JSX.Element => (
          <Select<OptionType>
            disabled={disabled}
            id={`${namePrefix}-resource-state`}
            label="Aukiolon tyyppi"
            options={sanitizedResourceStateOptions}
            className="opening-hours-resource-state-select"
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
          <Button variant="danger" onClick={onDelete} fullWidth>
            Poista<span className="sr-only">{groupLabel}</span>
          </Button>
        )}
      </div>
      {resourceState === ResourceState.OTHER && (
        <div className="opening-hours-time-span__description-container">
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

  console.log(namePrefix);

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
          + Lisää tarkennus
        </button>
      </div>
    </>
  );
};

const isOnlySelectedDay = (day: number, weekdays: number[]): boolean =>
  weekdays.length === 1 && weekdays[0] === day;

const defaultTimeSpan = {
  start_time: null,
  end_time: null,
  full_day: false,
  resourceState: ResourceState.OPEN,
};

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
    { value: '0', label: 'Joka viikko' },
    { value: '1', label: 'Joka toinen viikko' },
    { value: '2', label: 'Joka kolmas viikko' },
    { value: '3', label: 'Joka neljäs viikko' },
  ];
  const { control, watch } = useFormContext<OpeningHoursFormState>();
  const { fields } = useFieldArray({
    control,
    name: `${namePrefix}.timeSpanGroups`,
  });
  const [removedDay, setRemovedDay] = React.useState<number | null>(null);
  const weekdays = watch(`${namePrefix}.weekdays`, []) as number[];
  const removedDayLabel = removedDay
    ? getWeekdayLongNameByIndexAndLang({
        weekdayIndex: removedDay,
        language: Language.FI,
      })
    : '';

  const groupWeekdays = (weekdaysToIterate: number[]): number[][] =>
    weekdaysToIterate.sort().reduce((acc: number[][], day): number[][] => {
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
            item.weekdays.length === 1
              ? `${resolveDayTranslation(item.weekdays[0], true)} aukioloajat`
              : `${groupWeekdays(item.weekdays)
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
        <div id={`${namePrefix}-weekdays`} className="weekdays-label">
          Päivä tai päiväryhmä
        </div>
        <div className="weekdays-container">
          <div
            className="weekdays"
            role="group"
            aria-labelledby={`${namePrefix}-weekdays`}>
            {removedDay && (
              <Notification
                key={removedDay}
                label={`${upperFirst(
                  removedDayLabel
                )}-päivä siirretty omaksi riviksi`}
                position="bottom-right"
                dismissible
                autoClose
                displayAutoCloseProgress={false}
                closeButtonLabelText="Sulje ilmoitus"
                onClose={(): void => setRemovedDay(null)}
                style={{ zIndex: 100 }}>
                {`Juuri poistettu ${removedDayLabel} siirrettiin omaksi rivikseen.`}
              </Notification>
            )}
            <Controller
              control={control}
              defaultValue={item.weekdays ?? []}
              name={`${namePrefix}.weekdays`}
              render={(): JSX.Element => (
                <>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <DayCheckbox
                      key={`${namePrefix}-${day}`}
                      checked={weekdays.includes(day)}
                      currentDay={day}
                      namePrefix={namePrefix}
                      onChange={(checked): void => {
                        onDayChange(day, checked);
                        if (
                          !isOnlySelectedDay(day, item.weekdays) &&
                          !checked
                        ) {
                          setRemovedDay(day);
                        }
                      }}
                    />
                  ))}
                </>
              )}
            />
          </div>
        </div>
      </div>
      {fields.map((field, i) => (
        <Fragment key={field.id}>
          <Controller
            defaultValue={options[0]}
            name={`${namePrefix}.timeSpanGroups[${i}].rule`}
            control={control}
            render={({ onChange, value }): JSX.Element => (
              <Select<OptionType>
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
          <OpeningHoursTimeSpans
            resourceStates={resourceStates}
            namePrefix={`${namePrefix}.timeSpanGroups[${i}].timeSpans`}
          />
        </Fragment>
      ))}
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
        weekdays: [1, 2, 3, 4, 5],
        timeSpanGroups: [
          {
            timeSpans: [defaultTimeSpan],
          },
        ],
      },
      {
        weekdays: [6, 7],
        timeSpanGroups: [
          {
            timeSpans: [
              { ...defaultTimeSpan, resource_state: ResourceState.CLOSED },
            ],
          },
        ],
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
    const weekdays = getValues(`openingHours[${idx}].weekdays`) as number[];

    return weekdays.length === 0;
  };

  const setDay = (i: number, day: number, checked: boolean): void => {
    const weekdays = getValues(`openingHours[${i}].weekdays`) as number[];
    if (checked) {
      setValue(`openingHours[${i}].weekdays`, [...weekdays, day]);
    } else {
      setValue(
        `openingHours[${i}].weekdays`,
        weekdays.filter((d) => d !== day)
      );
    }
  };

  const findPreviousChecked = (i: number, day: number): number =>
    fields.findIndex(
      (item, idx) =>
        idx !== i &&
        (getValues(`openingHours[${idx}].weekdays`) as number[]).includes(day)
    );

  const addNewRow = (currIndex: number, day: number): void => {
    const newIdx = currIndex + 1;
    const values = {
      weekdays: [day],
      timeSpanGroups: [
        {
          rule: {
            label: '0',
            value: 'Joka viikko',
          },
          timeSpans: [defaultTimeSpan],
        },
      ],
    };
    insert(newIdx, values, false);
    // FIXME: For some reason the normal array won't get added in the insert
    setValue(`openingHours[${newIdx}]`, values);
    setDropInRow(newIdx);
  };

  const onSubmit = (data: OpeningHoursFormState): Promise<DatePeriod> => {
    if (!resource) {
      throw new Error('Resource not found');
    }
    return api.postDatePeriod(
      openingHoursToApiDatePeriod(resource?.id, data.openingHours)
    );
  };

  const { openingHours } = watch();

  return (
    (resource && datePeriodConfig && (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="opening-hours-page">
            <div className="opening-hours-page__content">
              <section className="opening-hours-section">
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
                        const weekdays = (getValues(
                          `openingHours[${i}].weekdays`
                        ) as number[]).filter((d) => d !== day);
                        if (weekdays.length) {
                          setValue(`openingHours[${i}].weekdays`, weekdays);
                          addNewRow(i, day);
                        }
                      }
                    }}
                  />
                ))}
              </section>
              <Preview
                openingHours={openingHours}
                resourceStates={resourceStates}
              />
            </div>
            <div className="opening-hours-page__title">
              <div>
                <h1 data-test="resource-info" className="resource-info-title">
                  {resource?.name?.fi}
                </h1>
                {/* <span>Osoite: {resource?.address.fi}</span>
            <p className="opening-hour-forms-required-help-text">
              Kaikki kentät jotka ovat merkitty{' '}
              <span className="asterisk">*</span>:llä ovat pakollisia
            </p> */}
              </div>
              <div className="opening-hours-page__actions">
                <PrimaryButton type="submit">Tallenna muutokset</PrimaryButton>
                <SecondaryButton onClick={returnToResourcePage}>
                  Peruuta ja palaa
                </SecondaryButton>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    )) || <h1>Ladataan...</h1>
  );
};
