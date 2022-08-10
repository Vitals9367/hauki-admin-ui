/* eslint-disable */
import { Accordion, IconSort } from 'hds-react';
import React, { useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  DatePeriod,
  Language,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
  OpeningHoursFormValues,
} from '../../common/lib/types';
import { SupplementaryButton } from '../button/Button';
import OpeningHoursFormPreview from '../opening-hours-form-preview/OpeningHoursFormPreview';
import './OpeningHoursForm.scss';
import {
  apiDatePeriodToFormValues,
  byWeekdays,
  formValuesToApiDatePeriod,
} from '../../common/helpers/opening-hours-helpers';
import toast from '../notification/Toast';
import OpeningHoursWeekdays from '../opening-hours-weekdays/OpeningHoursWeekdays';
import { defaultTimeSpan, defaultTimeSpanGroup } from '../../constants';
import OpeningHoursValidity from './OpeningHoursValidity';
import useMobile from '../../hooks/useMobile';
import { formatDate } from '../../common/utils/date-time/format';
import OpeningHoursTitles from './OpeningHoursTitles';
import OpeningHoursFormPreviewMobile from '../opening-hours-form-preview/OpeningHoursFormPreviewMobile';
import ResourceTitle from '../resource-title/ResourceTitle';
import { useAppContext } from '../../App-context';
import useReturnToResourcePage from '../../hooks/useReturnToResourcePage';
import OpeningHoursFormActions from './OpeningHoursFormActions';

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
            timeSpanGroups: [defaultTimeSpanGroup],
          },
          {
            weekdays: [6, 7],
            timeSpanGroups: [
              {
                ...defaultTimeSpanGroup,
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
  const [isSaving, setSaving] = useState(false);
  const [dropInRow, setDropInRow] = useState<number>();
  const offsetTop = useRef<number>();
  const form = useForm<OpeningHoursFormValues>({
    defaultValues,
  });
  const { control, getValues, reset, setValue, watch } = form;
  const { insert, fields, remove } = useFieldArray({
    control,
    name: 'openingHours',
  });
  const isMobile = useMobile();
  const {
    resourceState: { options: resourceStates = [] },
  } = datePeriodConfig;

  const returnToResourcePage = useReturnToResourcePage();
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

  const allDayAreUncheckedForRow = (idx: number): boolean => {
    const weekdays = getValues(`openingHours.${idx}.weekdays`) as number[];

    return weekdays.length === 0;
  };

  const setDay = (i: number, day: number, checked: boolean): void => {
    const weekdays = getValues(`openingHours.${i}.weekdays`) as number[];
    if (checked) {
      setValue(`openingHours.${i}.weekdays`, [...weekdays, day]);
    } else {
      setValue(
        `openingHours.${i}.weekdays`,
        weekdays.filter((d) => d !== day)
      );
    }
  };

  const findPreviousChecked = (currentIdx: number, day: number): number =>
    fields.findIndex(
      (item, idx: number) =>
        idx !== currentIdx &&
        (getValues(`openingHours.${idx}.weekdays`) as number[]).includes(day)
    );

  const addNewRow = (currIndex: number, day: number): void => {
    const newIdx = currIndex + 1;
    const values = {
      weekdays: [day],
      timeSpanGroups: [defaultTimeSpanGroup],
    };
    insert(newIdx, values, { shouldFocus: false });
    setDropInRow(newIdx);
  };

  const toggleWeekday = (openingHoursIdx: number) => (
    day: number,
    checked: boolean,
    newOffsetTop: number
  ) => {
    offsetTop.current = newOffsetTop;
    setDropInRow(undefined);
    if (checked) {
      setDay(openingHoursIdx, day, true);
      const prevId = findPreviousChecked(openingHoursIdx, day);
      if (prevId >= 0) {
        setDay(prevId, day, false);
        if (allDayAreUncheckedForRow(prevId)) {
          remove(prevId);
        }
      }
    } else {
      const weekdays = getValues(
        `openingHours.${openingHoursIdx}.weekdays`
      ).filter((d) => d !== day);
      if (weekdays.length) {
        setValue(`openingHours.${openingHoursIdx}.weekdays`, weekdays);
        addNewRow(openingHoursIdx, day);
      }
    }
  };

  const sortOpeningHours = () => {
    setDropInRow(undefined);
    reset({
      ...getValues(),
      openingHours: [...openingHours].sort(byWeekdays),
    });
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
                    <OpeningHoursWeekdays
                      key={field.id}
                      dropIn={dropInRow === i}
                      offsetTop={offsetTop.current}
                      i={i}
                      item={field}
                      resourceStates={resourceStates}
                      onDayChange={toggleWeekday(i)}
                    />
                  ))}
                </section>
                <aside className="opening-hours-form__aside">
                  <OpeningHoursFormPreview
                    openingHours={openingHours}
                    resourceStates={resourceStates}
                    tabIndex={isMobile ? -1 : 0}
                  />
                  <div className="sort-weekdays-container">
                    <SupplementaryButton
                      iconLeft={<IconSort />}
                      onClick={sortOpeningHours}>
                      Järjestä päiväryhmät viikonpäivien mukaan
                    </SupplementaryButton>
                  </div>
                </aside>
              </div>
            </section>
          </div>
          <OpeningHoursFormActions isSaving={isSaving} />
        </form>
      </FormProvider>
    )) || <h1>Ladataan...</h1>
  );
};

export default OpeningHoursForm;
