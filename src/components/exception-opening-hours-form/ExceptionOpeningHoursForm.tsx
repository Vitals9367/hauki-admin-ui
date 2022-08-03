import { DateInput } from 'hds-react';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAppContext } from '../../App-context';
import { formValuesToApiDatePeriod } from '../../common/helpers/opening-hours-helpers';
import {
  DatePeriod,
  Language,
  OpeningHoursFormValues,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import { formatDate } from '../../common/utils/date-time/format';
import { defaultTimeSpan } from '../../constants';
import useReturnToResourcePage from '../../hooks/useReturnToResourcePage';
import ExceptionOpeningHours from '../exception-opening-hours-form-inputs/ExceptionOpeningHoursFormInputs';
import toast from '../notification/Toast';
import OpeningHoursFormActions from '../opening-hours-form/OpeningHoursFormActions';
import OpeningHoursTitles from '../opening-hours-form/OpeningHoursTitles';
import ResourceTitle from '../resource-title/ResourceTitle';
import './ExceptionOpeningHoursForm.scss';

const formValuesToException = (
  resourceIdToSave: number,
  values: OpeningHoursFormValues
): DatePeriod => {
  const data = formValuesToApiDatePeriod(resourceIdToSave, values, values.id);
  return {
    ...data,
    end_date: data.start_date,
    override: true,
  };
};

const getDefaultFormValues = ({
  date,
  name,
}: {
  date?: string;
  name?: string;
}): OpeningHoursFormValues => ({
  startDate: date ?? formatDate(new Date().toISOString()),
  endDate: date ?? formatDate(new Date().toISOString()),
  fixed: true,
  name: { fi: name ?? '', sv: '', en: '' },
  override: true,
  resourceState: ResourceState.CLOSED,
  openingHours: [],
});

const ExceptionOpeningHoursForm = ({
  datePeriodConfig,
  resource,
  submitFn,
}: {
  datePeriodConfig: UiDatePeriodConfig;
  resource: Resource;
  submitFn: (datePeriod: DatePeriod) => Promise<DatePeriod>;
}): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  const form = useForm<OpeningHoursFormValues>({
    defaultValues: getDefaultFormValues({}),
    shouldUnregister: false,
  });
  const { register, setValue, watch } = form;
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
              <DateInput
                id="exception-date"
                className="exception-date"
                data-test="exception-date"
                ref={register()}
                disableConfirmation
                initialMonth={new Date()}
                label="Poikkeavan päivän päivämäärä"
                language={language}
                name="startDate"
                openButtonAriaLabel="Valitse päivämäärä"
                value={startDate ?? ''}
              />
              <ExceptionOpeningHours
                id="exception-opening-hours-form"
                onClose={(): void => {
                  setValue('resourceState', ResourceState.CLOSED);
                  setValue('openingHours', []);
                }}
                onOpen={(): void => {
                  setValue('resourceState', ResourceState.UNDEFINED);
                  setValue('openingHours', [
                    {
                      timeSpanGroups: [
                        {
                          timeSpans: [defaultTimeSpan],
                        },
                      ],
                    },
                  ]);
                }}
                resourceStates={datePeriodConfig.resourceState.options}
                isOpen={false}
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
