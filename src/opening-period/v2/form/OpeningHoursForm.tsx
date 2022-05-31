/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  Accordion,
  Checkbox,
  IconPlusCircle,
  IconSort,
  IconTrash,
  Notification,
  Select,
  TextInput,
  TimeInput,
} from 'hds-react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { upperFirst } from 'lodash';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  Language,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../../common/lib/types';
import {
  getWeekdayLongNameByIndexAndLang,
  getWeekdayShortNameByIndexAndLang,
} from '../../../common/utils/date-time/format';
import {
  PrimaryButton,
  SecondaryButton,
  SupplementaryButton,
} from '../../../components/button/Button';
import Preview from '../preview/OpeningHoursPreview';
import './OpeningHoursForm.scss';
import {
  OpeningHours as TOpeningHours,
  OpeningHoursTimeSpan as TOpeningHoursTimeSpan,
  OpeningHoursTimeSpanGroup,
  OptionType,
} from '../types';
import {
  apiDatePeriodToOpeningHours,
  openingHoursToApiDatePeriod,
  sortOpeningHours,
} from '../helpers/opening-hours-helpers';
import toast from '../../../components/notification/Toast';

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
      <div className="remove-time-span">
        {onDelete && (
          <SupplementaryButton
            className="remove-time-span-button"
            iconLeft={<IconTrash />}
            onClick={onDelete}>
            Poista rivi<span className="sr-only">{groupLabel}</span>
          </SupplementaryButton>
        )}
      </div>
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
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      {fields.map((field, i) => (
        <OpeningHoursTimeSpan
          key={field.id}
          groupLabel={`aukiolomääritys ${i + 1}`}
          item={field as TOpeningHoursTimeSpan}
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
          iconLeft={<IconPlusCircle className="add-time-span-button__icon" />}
          onClick={(): void => append({})}
          type="button">
          <span className="add-time-span-button__text">
            Lisää aukiolomääritys
          </span>
        </SupplementaryButton>
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
  remove: fadeOut,
  item,
  offsetTop = 0,
  resourceStates,
  namePrefix,
  onDayChange,
  onRemove,
}: {
  dropIn: boolean;
  remove: boolean;
  item: TOpeningHours;
  namePrefix: string;
  offsetTop?: number;
  resourceStates: OptionType[];
  onDayChange: (day: number, checked: boolean, offsetTop: number) => void;
  onRemove: () => void;
}): JSX.Element => {
  const options = [
    { value: '0', label: 'Joka viikko' },
    { value: '1', label: 'Parilliset viikot' },
    { value: '2', label: 'Parittomat viikot' },
    // { value: '3', label: 'Joka neljäs viikko' },
  ];

  const { control, watch } = useFormContext<OpeningHoursFormState>();
  const { append, fields } = useFieldArray<OpeningHoursTimeSpanGroup>({
    control,
    name: `${namePrefix}.timeSpanGroups`,
  });
  const [removedDay, setRemovedDay] = React.useState<number | null>(null);
  const [isMoving, setIsMoving] = React.useState<boolean>(false);
  const ref = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropIn) {
      const dropInAnimation = [
        {
          marginTop: `-${
            ref.current.getBoundingClientRect().top - offsetTop
          }px`,
        },
        { marginTop: 0 },
      ];
      setIsMoving(true);
      ref.current
        .animate(dropInAnimation, {
          duration: 600,
          iterations: 1,
          easing: 'ease',
        })
        .addEventListener('finish', () => setIsMoving(false));
    }
  }, [dropIn, offsetTop, ref, setIsMoving]);

  useEffect(() => {
    if (fadeOut) {
      if (containerRef.current) {
        const currentOffsetHeightPixels = `${containerRef.current?.offsetHeight}px`;
        containerRef.current.style.height = currentOffsetHeightPixels;
        setIsMoving(true);
        containerRef.current
          .animate(
            [
              { height: currentOffsetHeightPixels },
              {
                height: 0,
                opacity: 0,
              },
            ],
            {
              duration: 350,
              iterations: 1,
              fill: 'forwards',
            }
          )
          .addEventListener('finish', () => {
            setIsMoving(false);
            onRemove();
          });
      }
    }
  }, [offsetTop, fadeOut, onRemove, setIsMoving]);

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

  const weekdayGroup = upperFirst(
    item.weekdays.length === 1
      ? `${resolveDayTranslation(item.weekdays[0], true)} aukioloajat`
      : `${groupWeekdays(item.weekdays)
          .map((group) =>
            group.length === 1
              ? resolveDayTranslation(group[0], false)
              : `${resolveDayTranslation(
                  group[0],
                  false
                )}-${resolveDayTranslation(group[group.length - 1], false)}`
          )
          .join(', ')} aukioloajat`
  );

  return (
    <div ref={containerRef} style={{ zIndex: isMoving ? 1 : undefined }}>
      <div ref={ref} className="opening-hours-container">
        <div>
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
                          onDayChange(
                            day,
                            checked,
                            ref.current?.getBoundingClientRect().top
                          );
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
        <div
          className="opening-hours-group"
          aria-labelledby={`${namePrefix}-opening-hours-group`}
          role="group">
          <span className="sr-only" id={`${namePrefix}-opening-hours-group`}>
            {weekdayGroup}
          </span>
          {fields.map((field, i) => (
            <Fragment key={field.id}>
              <Controller
                defaultValue={field.rule || options[0]}
                name={`${namePrefix}.timeSpanGroups[${i}].rule`}
                control={control}
                render={({ onChange, value }): JSX.Element => (
                  <Select<OptionType>
                    className="rule-select"
                    defaultValue={options[0]}
                    label="Toistuvuus"
                    onChange={(rule: OptionType) => {
                      if (i === 0 && fields.length === 1) {
                        append({
                          rule: options[2],
                          timeSpans: [defaultTimeSpan],
                        });
                      }
                      onChange(rule);
                    }}
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
      </div>
    </div>
  );
};

const SimpleCreateOpeningHours = ({
  datePeriod,
  datePeriodConfig,
  submitFn,
  resource,
}: {
  datePeriod?: DatePeriod;
  datePeriodConfig: UiDatePeriodConfig;
  submitFn: (values: DatePeriod) => Promise<DatePeriod>;
  resource: Resource;
}): JSX.Element => {
  const defaultValues = {
    openingHours: sortOpeningHours(
      datePeriod
        ? apiDatePeriodToOpeningHours(datePeriod)
        : [
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
                    {
                      ...defaultTimeSpan,
                      resource_state: ResourceState.CLOSED,
                    },
                  ],
                },
              ],
            },
          ]
    ),
  };

  const history = useHistory();
  const [isSaving, setSaving] = useState(false);
  const [dropInRow, setDropInRow] = useState<number>();
  const [rowToBeRemoved, setRowToBeRemoved] = useState<string[]>([]);
  const offsetTop = useRef<number>();
  const form = useForm<OpeningHoursFormState>({
    defaultValues,
    shouldUnregister: false,
  });

  const { control, getValues, reset, setValue, watch } = form;
  const { insert, fields, remove } = useFieldArray<TOpeningHours>({
    control,
    name: 'openingHours',
  });

  const returnToResourcePage = (): void =>
    history.push(`/resource/${resource.id}`);

  const onSubmit = (values: OpeningHoursFormState): void => {
    if (!resource) {
      throw new Error('Resource not found');
    }
    setSaving(true);
    submitFn(
      openingHoursToApiDatePeriod(
        resource?.id,
        values.openingHours,
        datePeriod?.id
      )
    )
      .then(() => {
        toast.success({
          dataTestId: 'opening-period-form-success',
          label: 'Tallennus onnistui',
          text: 'Aukiolon tallennus onnistui',
        });
        returnToResourcePage();
      })
      .catch(() => {
        toast.error({
          dataTestId: 'opening-period-form-error',
          label: 'Tallennus epäonnistui',
          text: 'Aukiolon tallennus epäonnistui',
        });
      })
      .finally(() => setSaving(false));
  };

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
            value: '0',
            label: 'Joka viikko',
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

  const { openingHours } = watch();

  return (
    (resource && datePeriodConfig && (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="opening-hours-page">
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
                <PrimaryButton
                  isLoading={isSaving}
                  loadingText="Tallentaa aukioloaikoja"
                  type="submit">
                  Tallenna muutokset
                </PrimaryButton>
                <SecondaryButton onClick={returnToResourcePage}>
                  Peruuta ja palaa
                </SecondaryButton>
              </div>
            </div>
            <Accordion card heading="Ohjeet">
              WIP
            </Accordion>
            <div className="opening-hours-page__content">
              <section className="opening-hours-section">
                {fields.map((field, i) => (
                  <OpeningHours
                    key={field.id}
                    dropIn={dropInRow === i}
                    remove={rowToBeRemoved.includes(field.id!)}
                    offsetTop={offsetTop.current}
                    item={field as TOpeningHours}
                    resourceStates={resourceStates}
                    namePrefix={`openingHours[${i}]`}
                    onDayChange={(day, checked, newOffsetTop: number): void => {
                      offsetTop.current = newOffsetTop;
                      setDropInRow(undefined);
                      if (checked) {
                        setDay(i, day, true);
                        const prevId = findPreviousChecked(i, day);
                        if (prevId >= 0) {
                          setDay(prevId, day, false);
                          if (allDayAreUncheckedForRow(prevId)) {
                            setRowToBeRemoved((state) => [
                              ...state,
                              fields[prevId].id!,
                            ]);
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
                    onRemove={(): void => {
                      remove(
                        fields.findIndex((f) => rowToBeRemoved.includes(f.id!))
                      );
                    }}
                  />
                ))}
              </section>
              <div className="aside">
                <Preview
                  openingHours={openingHours}
                  resourceStates={resourceStates}
                />
                <div className="sort-weekdays-container">
                  <SupplementaryButton
                    iconLeft={<IconSort />}
                    onClick={() => {
                      setDropInRow(undefined);
                      reset({ openingHours: sortOpeningHours(openingHours) });
                    }}>
                    Järjestä päiväryhmät viikonpäivien mukaan
                  </SupplementaryButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    )) || <h1>Ladataan...</h1>
  );
};

export default SimpleCreateOpeningHours;
