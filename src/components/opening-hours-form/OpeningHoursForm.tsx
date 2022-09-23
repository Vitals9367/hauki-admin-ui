/* eslint-disable */
import { Accordion, IconSort } from 'hds-react';
import React, { useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  ApiDatePeriod,
  Language,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
  DatePeriod,
} from '../../common/lib/types';
import { SupplementaryButton } from '../button/Button';
import OpeningHoursFormPreview from '../opening-hours-form-preview/OpeningHoursFormPreview';
import './OpeningHoursForm.scss';
import {
  apiDatePeriodToDatePeriod,
  byWeekdays,
  datePeriodToApiDatePeriod,
  datePeriodToRules,
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

const getDefaultsValues = (datePeriod: ApiDatePeriod | undefined): DatePeriod =>
  datePeriod
    ? apiDatePeriodToDatePeriod(datePeriod)
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
  datePeriod?: ApiDatePeriod;
  datePeriodConfig: UiDatePeriodConfig;
  submitFn: (values: ApiDatePeriod) => Promise<ApiDatePeriod>;
  resource: Resource;
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  const defaultValues: DatePeriod = getDefaultsValues(datePeriod);
  const [isSaving, setSaving] = useState(false);
  const [dropInRow, setDropInRow] = useState<number>();
  const offsetTop = useRef<number>();
  const form = useForm<DatePeriod>({
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
  const rules = datePeriodToRules(defaultValues);

  const returnToResourcePage = useReturnToResourcePage();
  const onSubmit = (values: DatePeriod): void => {
    if (!resource) {
      throw new Error('Resource not found');
    }
    setSaving(true);
    submitFn(datePeriodToApiDatePeriod(resource?.id, values))
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
    // FIXME: For some reason the normal array won't get added in the insert
    setValue(`openingHours.${newIdx}`, values);
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

  const formValues = watch();

  const sortOpeningHours = () => {
    setDropInRow(undefined);
    reset({
      ...getValues(),
      openingHours: [...formValues.openingHours].sort(byWeekdays),
    });
  };

  return (
    (resource && datePeriodConfig && (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="opening-hours-form">
            <ResourceTitle
              language={language}
              resource={resource}
              titleAddon={formValues.name[language] || undefined}>
              <div className="mobile-preview-container">
                <OpeningHoursFormPreviewMobile
                  datePeriod={formValues}
                  language={language}
                  resourceStates={resourceStates}
                />
              </div>
            </ResourceTitle>
            <section className="opening-hours-form__content">
              <Accordion card heading="Ohjeet">
                <a
                  href="https://kaupunkialustana.hel.fi/aukiolosovellus-ohje/"
                  target="_blank">
                  Aukiolosovellus ohje
                </a>
                <p className="required-fields-text">
                  Tähdellä (*) merkityt kohdat ovat pakollisia.
                </p>
              </Accordion>
              <OpeningHoursTitles
                placeholders={{
                  fi: 'Esim. kesäkausi',
                  sv: 'T.ex. sommartid',
                  en: 'E.g. summertime',
                }}
              />
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
                      rules={rules}
                      onDayChange={toggleWeekday(i)}
                    />
                  ))}
                </section>
                <aside className="opening-hours-form__aside">
                  <OpeningHoursFormPreview
                    datePeriod={formValues}
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
