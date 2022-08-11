import { DateInput } from 'hds-react';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useAppContext } from '../../App-context';
import {
  apiDatePeriodToFormValues,
  formValuesToApiDatePeriod,
} from '../../common/helpers/opening-hours-helpers';
import {
  DatePeriod,
  Language,
  OpeningHoursFormValues,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import {
  formatDate,
  getNumberOfTheWeekday,
  transformDateToApiFormat,
} from '../../common/utils/date-time/format';
import { defaultTimeSpanGroup } from '../../constants';
import useReturnToResourcePage from '../../hooks/useReturnToResourcePage';
import ExceptionOpeningHoursFormInputs from '../exception-opening-hours-form-inputs/ExceptionOpeningHoursFormInputs';
import toast from '../notification/Toast';
import OpeningHoursFormActions from '../opening-hours-form/OpeningHoursFormActions';
import OpeningHoursTitles from '../opening-hours-form/OpeningHoursTitles';
import ResourceTitle from '../resource-title/ResourceTitle';
import './ExceptionOpeningHoursForm.scss';

function resolveWeekday(
  values: OpeningHoursFormValues
): OpeningHoursFormValues {
  if (values.resourceState === ResourceState.CLOSED) {
    return values;
  }

  if (!values.startDate) {
    throw new Error('No start date set by default');
  }

  return {
    ...values,
    openingHours: [
      {
        ...values.openingHours[0],

        weekdays: [
          getNumberOfTheWeekday(transformDateToApiFormat(values.startDate)),
        ],
      },
    ],
  };
}

const formValuesToException = (
  resourceIdToSave: number,
  values: OpeningHoursFormValues
): DatePeriod => {
  const data = formValuesToApiDatePeriod(
    resourceIdToSave,
    resolveWeekday(values),
    values.id
  );

  return {
    ...data,
    end_date: data.start_date,
    override: true,
  };
};

const getDefaultFormValues = (
  datePeriod: DatePeriod | undefined
): OpeningHoursFormValues => {
  if (datePeriod) {
    return apiDatePeriodToFormValues(datePeriod);
  }

  const now = new Date().toISOString();
  return {
    startDate: formatDate(now),
    endDate: formatDate(now),
    fixed: true,
    name: { fi: '', sv: '', en: '' },
    override: true,
    resourceState: ResourceState.CLOSED,
    openingHours: [],
  };
};

const ExceptionOpeningHoursForm = ({
  datePeriod,
  datePeriodConfig,
  resource,
  submitFn,
}: {
  datePeriod?: DatePeriod;
  datePeriodConfig: UiDatePeriodConfig;
  resource: Resource;
  submitFn: (datePeriod: DatePeriod) => Promise<DatePeriod>;
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  const defaultValues = getDefaultFormValues(datePeriod);
  const form = useForm<OpeningHoursFormValues>({
    defaultValues,
  });
  const { setValue, watch } = form;
  const startDate = watch('startDate');
  const returnToResourcePage = useReturnToResourcePage();
  const [isSaving, setSaving] = useState<boolean>(false);

  const onSubmit = (data: OpeningHoursFormValues): void => {
    setSaving(true);
    submitFn(formValuesToException(resource.id, data))
      .then(() => {
        setSaving(false);
        returnToResourcePage();
        toast.success({
          dataTestId: 'exception-opening-hours-form-success',
          label: 'Aukiolon lisääminen onnistui',
          text: `Poikkeavan päivän aukiolon lisääminen onnistui`,
        });
      })
      .catch(() => {
        setSaving(false);
        toast.error({
          dataTestId: 'exception-opening-hours-form-error',
          label: 'Aukiolon lisääminen epäonnistui',
          text: `Poikkeavan päivän aukiolon lisääminen epäonnistui`,
        });
      });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <ResourceTitle language={language} resource={resource} />
          <div className="exception-opening-hours-form">
            <OpeningHoursTitles />
            <div className="card">
              <Controller
                defaultValue={startDate ?? ''}
                name="startDate"
                render={({
                  field: { name, onBlur, onChange, value },
                }): JSX.Element => (
                  <DateInput
                    id="exception-date"
                    className="exception-date"
                    data-test="exception-date"
                    disableConfirmation
                    initialMonth={new Date()}
                    label="Poikkeavan päivän päivämäärä"
                    language={language}
                    name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    openButtonAriaLabel="Valitse päivämäärä"
                    required
                    value={value}
                  />
                )}
              />
              <ExceptionOpeningHoursFormInputs
                id="exception-opening-hours-form"
                onClose={(): void => {
                  setValue('resourceState', ResourceState.CLOSED);
                  setValue('openingHours', []);
                }}
                onOpen={(): void => {
                  setValue('resourceState', ResourceState.UNDEFINED);
                  setValue('openingHours', [
                    {
                      timeSpanGroups: [defaultTimeSpanGroup],
                      weekdays: [],
                    },
                  ]);
                }}
                resourceStates={datePeriodConfig.resourceState.options}
                isOpen={
                  defaultValues.resourceState
                    ? defaultValues.resourceState !== ResourceState.CLOSED
                    : false
                }
              />
            </div>
          </div>
          <OpeningHoursFormActions isSaving={isSaving} />
        </div>
      </form>
    </FormProvider>
  );
};

export default ExceptionOpeningHoursForm;
