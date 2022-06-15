/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Accordion, IconSort } from 'hds-react';
import React, { useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  Language,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../../../common/lib/types';
import {
  PrimaryButton,
  SecondaryButton,
  SupplementaryButton,
} from '../../../../components/button/Button';
import Preview from '../preview/OpeningHoursFormPreview';
import './OpeningHoursForm.scss';
import {
  OpeningHours as TOpeningHours,
  OpeningHoursFormValues,
} from '../../types';
import {
  apiDatePeriodToFormValues,
  byWeekdays,
  formValuesToApiDatePeriod,
} from '../../../../common/helpers/opening-hours-helpers';
import toast from '../../../../components/notification/Toast';
import OpeningHours from '../opening-hours/OpeningHours';
import { defaultTimeSpan } from '../../constants';
import OpeningHoursValidity from './OpeningHoursValidity';
import useMobile from '../../../../hooks/useMobile';
import { formatDate } from '../../../../common/utils/date-time/format';
import OpeningHoursTitles from './OpeningHoursTitles';
import OpeningHoursFormPreviewMobile from '../preview/OpeningHoursFormPreviewMobile';
import ResourceTitle from '../../../../components/resource-title/ResourceTitle';
import { useAppContext } from '../../../../App-context';

const getDefaultsValues = (
  datePeriod: DatePeriod | undefined
): OpeningHoursFormValues =>
  datePeriod
    ? apiDatePeriodToFormValues(datePeriod)
    : {
        fixed: false,
        endDate: null,
        startDate: formatDate(new Date().toISOString()),
        name: {
          fi: null,
          sv: null,
          en: null,
        },
        openingHours: [
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
  const { language = Language.FI } = useAppContext();
  const defaultValues: OpeningHoursFormValues = getDefaultsValues(datePeriod);
  const history = useHistory();
  const [isSaving, setSaving] = useState(false);
  const [dropInRow, setDropInRow] = useState<number>();
  const offsetTop = useRef<number>();
  const form = useForm<OpeningHoursFormValues>({
    defaultValues,
    shouldUnregister: false,
  });
  const { control, getValues, reset, setValue, watch } = form;
  const { insert, fields, remove } = useFieldArray<TOpeningHours>({
    control,
    name: 'openingHours',
  });
  const isMobile = useMobile();

  const returnToResourcePage = (): void =>
    history.push(`/resource/${resource.id}`);

  const onSubmit = (values: OpeningHoursFormValues): void => {
    if (!resource) {
      throw new Error('Resource not found');
    }
    setSaving(true);
    submitFn(formValuesToApiDatePeriod(resource?.id, values, datePeriod?.id))
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

  const resourceStates = datePeriodConfig
    ? datePeriodConfig.resourceState.options
    : [];

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

  const { openingHours, name } = watch();

  return (
    (resource && datePeriodConfig && (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="opening-hours-form">
            <ResourceTitle
              language={language}
              resource={resource}
              titleAddon={name[language] || undefined}>
              <div className="mobile-preview-container">
                <OpeningHoursFormPreviewMobile
                  language={language}
                  openingHours={openingHours}
                  resourceStates={resourceStates}
                />
              </div>
            </ResourceTitle>
            <section className="opening-hours-form__content">
              <Accordion card heading="Ohjeet">
                WIP
              </Accordion>
              <OpeningHoursTitles />
              <OpeningHoursValidity />
              <div className="opening-hours-form__fields">
                <section className="opening-hours-section">
                  {fields.map((field, i) => (
                    <OpeningHours
                      key={field.id}
                      dropIn={dropInRow === i}
                      offsetTop={offsetTop.current}
                      item={field as TOpeningHours}
                      resourceStates={resourceStates}
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
                <aside className="opening-hours-form__aside">
                  <Preview
                    openingHours={openingHours}
                    resourceStates={resourceStates}
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
                </aside>
              </div>
            </section>
          </div>
          <div className="opening-hours-form__actions-container">
            <div className="card opening-hours-form__actions">
              <PrimaryButton
                isLoading={isSaving}
                loadingText="Tallentaa aukioloaikoja"
                type="submit"
                size={isMobile ? 'small' : 'default'}>
                Tallenna
              </PrimaryButton>
              <SecondaryButton
                onClick={returnToResourcePage}
                size={isMobile ? 'small' : 'default'}>
                Peruuta
              </SecondaryButton>
            </div>
          </div>
        </form>
      </FormProvider>
    )) || <h1>Ladataan...</h1>
  );
};

export default OpeningHoursForm;
