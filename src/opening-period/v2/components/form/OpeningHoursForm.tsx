/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  Accordion,
  DateInput,
  IconSort,
  RadioButton,
  TextInput,
} from 'hds-react';
import React, { useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../../../common/lib/types';
import {
  PrimaryButton,
  SecondaryButton,
  SupplementaryButton,
} from '../../../../components/button/Button';
import Preview from '../preview/OpeningHoursPreview';
import './OpeningHoursForm.scss';
import {
  OpeningHours as TOpeningHours,
  OpeningHoursFormState,
  Rule,
} from '../../types';
import {
  apiDatePeriodToOpeningHours,
  byWeekdays,
  openingHoursToApiDatePeriod,
} from '../../helpers/opening-hours-helpers';
import toast from '../../../../components/notification/Toast';
import OpeningHours from '../opening-hours/OpeningHours';
import { defaultTimeSpan } from '../../constants';
import { formatDate } from '../../../../common/utils/date-time/format';

const OpeningHoursForm = ({
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
  const defaultValues: OpeningHoursFormState = {
    startDate: datePeriod?.start_date ?? null,
    description: datePeriod?.description || {
      fi: null,
      sv: null,
      en: null,
    },
    openingHours: datePeriod
      ? apiDatePeriodToOpeningHours(datePeriod)
      : [
          {
            weekdays: [1, 2, 3, 4, 5],
            timeSpanGroups: [
              {
                rule: 'week_every' as const,
                timeSpans: [defaultTimeSpan],
              },
            ],
          },
          {
            weekdays: [6, 7],
            timeSpanGroups: [
              {
                rule: 'week_every' as const,
                timeSpans: [
                  {
                    ...defaultTimeSpan,
                    resource_state: ResourceState.CLOSED,
                  },
                ],
              },
            ],
          },
        ],
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

  const { control, getValues, register, reset, setValue, watch } = form;
  const { insert, fields, remove } = useFieldArray<TOpeningHours>({
    control,
    name: 'openingHours',
  });
  const [selectedItem, setSelectedItem] = useState(
    datePeriod?.start_date ? 1 : 0
  );
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedItem(+event.target.value);
  };

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
        values.description,
        selectedItem === 1 ? values.startDate : null,
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

  const rules: { value: Rule; label: string }[] = [
    { value: 'week_every', label: 'Joka viikko' },
    { value: 'week_even', label: 'Parilliset viikot' },
    { value: 'week_odd', label: 'Parittomat viikot' },
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
          rule: 'week_every' as const,
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
            <div className="titles-container">
              <TextInput
                ref={register()}
                id="title-fi"
                name="description.fi"
                label="Aukioloajan otsikko suomeksi"
              />
              <TextInput
                ref={register()}
                id="title-sv"
                name="description.sv"
                label="Aukioloajan otsikko ruotsiksi"
              />
              <TextInput
                ref={register()}
                id="title-en"
                name="description.en"
                label="Aukioloajan otsikko englanniksi"
              />
            </div>
            <div className="opening-hours-validity-container">
              <h2>Aukiolon voimassaoloaika</h2>
              <div className="opening-hours-validity-scheduled-container">
                <div>
                  <RadioButton
                    id="opening-hours-validity-recurring"
                    checked={selectedItem === 0}
                    name="example"
                    label="Toistaiseksi voimassa"
                    value="0"
                    onChange={onChange}
                  />
                  <RadioButton
                    id="opening-hours-validity-scheduled"
                    checked={selectedItem === 1}
                    name="example"
                    label="Voimassa tietyn ajan"
                    value="1"
                    onChange={onChange}
                  />
                </div>
                <DateInput
                  ref={register()}
                  id="opening-hours-start-time"
                  initialMonth={new Date()}
                  label="Astuu voimaan"
                  language="fi"
                  name="startDate"
                  disabled={selectedItem === 0}
                  value={
                    datePeriod?.start_date
                      ? formatDate(datePeriod?.start_date)
                      : ''
                  }
                />
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
                    rules={rules}
                    namePrefix={`openingHours[${i}]`}
                    onDayChange={(
                      day: number,
                      checked: boolean,
                      newOffsetTop: number
                    ): void => {
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
                  rules={rules}
                />
                <div className="sort-weekdays-container">
                  <SupplementaryButton
                    iconLeft={<IconSort />}
                    onClick={(): void => {
                      setDropInRow(undefined);
                      reset({ openingHours: openingHours.sort(byWeekdays) });
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

export default OpeningHoursForm;
