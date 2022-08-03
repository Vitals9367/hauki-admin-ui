import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox, LoadingSpinner } from 'hds-react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  DatePeriod,
  Holiday,
  Language,
  OpeningHoursFormValues,
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../common/lib/types';
import {
  apiDatePeriodToFormValues,
  formValuesToApiDatePeriod,
  isHoliday,
} from '../common/helpers/opening-hours-helpers';
import api from '../common/utils/api/api';
import { getDatePeriodFormConfig } from '../services/datePeriodFormConfig';
import { getHolidays } from '../services/holidays';
import {
  formatDate,
  getNumberOfTheWeekday,
} from '../common/utils/date-time/format';
import { PrimaryButton, SecondaryButton } from '../components/button/Button';
import { UpcomingHolidayNotification } from '../components/holidays-table/HolidaysTable';
import {
  ConfirmationModal,
  useModal,
} from '../components/modal/ConfirmationModal';
import ResourceTitle from '../components/resource-title/ResourceTitle';
import toast from '../components/notification/Toast';

import { useAppContext } from '../App-context';
import './EditHolidaysPage.scss';
import useReturnToResourcePage from '../hooks/useReturnToResourcePage';
import useMobile from '../hooks/useMobile';
import ExceptionOpeningHours from '../components/exception-opening-hours-form-inputs/ExceptionOpeningHoursFormInputs';
import { defaultTimeSpanGroup } from '../constants';

type FormActions = {
  create: (values: OpeningHoursFormValues) => Promise<void>;
  update: (values: OpeningHoursFormValues) => Promise<void>;
  delete: (values: OpeningHoursFormValues) => Promise<void>;
};

const getDefaultFormValues = ({
  name,
  holidayDate,
}: {
  name: string;
  holidayDate: string;
}): OpeningHoursFormValues => ({
  startDate: formatDate(holidayDate),
  endDate: formatDate(holidayDate),
  fixed: true,
  name: { fi: name, sv: '', en: '' },
  override: true,
  resourceState: ResourceState.CLOSED,
  openingHours: [],
});

const HolidayForm = ({
  holiday,
  value,
  datePeriodConfig,
  actions,
}: {
  holiday: Holiday;
  value?: OpeningHoursFormValues;
  datePeriodConfig: UiDatePeriodConfig;
  actions: FormActions;
}): JSX.Element => {
  const { name, date: holidayDate } = holiday;
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const valueToUse = value || getDefaultFormValues({ name, holidayDate });

  const form = useForm<OpeningHoursFormValues>({
    defaultValues: valueToUse,
    shouldUnregister: false,
  });

  const { setValue } = form;

  const onClosedSelect = (): void => {
    setValue('resourceState', ResourceState.CLOSED);
    setValue('openingHours', []);
  };

  const onOpenSelect = (): void => {
    setValue('resourceState', ResourceState.UNDEFINED);
    setValue('openingHours', [
      {
        timeSpanGroups: [defaultTimeSpanGroup],
        weekdays: [getNumberOfTheWeekday(holidayDate)],
      },
    ]);
  };

  const {
    resourceState: { options: resourceStates = [] },
  } = datePeriodConfig;

  const createNew = (values: OpeningHoursFormValues): void => {
    setIsSaving(true);
    actions.create(values);
  };

  const saveExisting = (values: OpeningHoursFormValues): void => {
    setIsSaving(true);
    actions.update(values).then(() => setIsSaving(false));
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={
          value?.id
            ? form.handleSubmit(saveExisting)
            : form.handleSubmit(createNew)
        }>
        <ExceptionOpeningHours
          id={holidayDate}
          isOpen={
            valueToUse && valueToUse.resourceState
              ? valueToUse.resourceState !== ResourceState.CLOSED
              : false
          }
          onClose={onClosedSelect}
          onOpen={onOpenSelect}
          resourceStates={resourceStates}
        />
        <div className="holiday-form-actions">
          <PrimaryButton
            dataTest="submit-opening-hours-button"
            isLoading={isSaving}
            loadingText="Tallentaa poikkeusaukioloa"
            type="submit">
            Tallenna
          </PrimaryButton>
        </div>
      </form>
    </FormProvider>
  );
};

const HolidayListItem = ({
  holiday,
  value,
  datePeriodConfig,
  actions,
}: {
  holiday: Holiday;
  value?: OpeningHoursFormValues;
  datePeriodConfig: UiDatePeriodConfig;
  actions: FormActions;
}): JSX.Element => {
  const [checked, setChecked] = useState<boolean>(!!value);
  const [willBeRemoved, setWillBeRemoved] = useState<boolean>(false);
  const { name, date } = holiday;
  const commonCheckBoxProps = {
    id: date,
    className: 'holiday-list-checkbox',
    label: `${name}   ${formatDate(date)}`,
    checked,
  };
  const { isModalOpen, openModal, closeModal } = useModal();

  return (
    <li className="holidays-list-item" key={date}>
      {value && value.id ? (
        <>
          <Checkbox
            {...commonCheckBoxProps}
            disabled={willBeRemoved}
            onChange={(): void => {
              openModal();
            }}
          />
          <ConfirmationModal
            onConfirm={async (): Promise<void> => {
              setWillBeRemoved(true);
              await actions.delete(value);
            }}
            title="Oletko varma että haluat poistaa aukiolojakson?"
            text={
              <>
                <p>Olet poistamassa aukiolojakson</p>
                <p>
                  <b>
                    {value.name.fi}
                    <br />
                    {value.startDate}
                  </b>
                </p>
              </>
            }
            isOpen={isModalOpen}
            close={closeModal}
            confirmText="Poista"
          />
        </>
      ) : (
        <Checkbox
          {...commonCheckBoxProps}
          onChange={(): void => {
            setChecked(!checked);
          }}
        />
      )}
      {willBeRemoved ? (
        <>
          <LoadingSpinner small />
          Poistetaan aukiolojaksoa..
        </>
      ) : (
        <div className="holiday-form-container" key={holiday.date}>
          {checked && (
            <HolidayForm
              holiday={holiday}
              value={value}
              datePeriodConfig={datePeriodConfig}
              actions={actions}
            />
          )}
        </div>
      )}
    </li>
  );
};

export default function EditHolidaysPage({
  resourceId,
}: {
  resourceId: string;
}): JSX.Element {
  const [resource, setResource] = useState<Resource>();
  const [holidayValues, setHolidayValues] = useState<
    OpeningHoursFormValues[] | undefined
  >();
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const { language = Language.FI } = useAppContext();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayPeriods, setHolidayPeriods] = useState<DatePeriod[]>([]);

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const [apiResource, uiDatePeriodOptions] = await Promise.all([
          api.getResource(resourceId),
          getDatePeriodFormConfig(),
        ]);
        setHolidays(getHolidays());
        setResource(apiResource);
        setDatePeriodConfig(uiDatePeriodOptions);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Fetching data failed in holidays page:', e);
      }
    };

    fetchData();
  }, [resourceId]);

  const fetchValues = useCallback(
    async (resourceIdentifier: number): Promise<void> => {
      const apiDatePeriods: DatePeriod[] = await api.getDatePeriods(
        resourceIdentifier
      );
      const holidayPeriodsResult: DatePeriod[] = apiDatePeriods.filter(
        (apiDatePeriod) => isHoliday(apiDatePeriod, holidays)
      );
      setHolidayPeriods(holidayPeriodsResult);
      const holidayValuesList: OpeningHoursFormValues[] = holidayPeriodsResult.map(
        apiDatePeriodToFormValues
      );
      setHolidayValues(holidayValuesList);
    },
    [holidays]
  );

  const formValuesToHolidayPeriod = (
    resourceIdToSave: number,
    values: OpeningHoursFormValues
  ): DatePeriod => ({
    ...formValuesToApiDatePeriod(resourceIdToSave, values, values.id),
    override: true,
  });

  const create = async (values: OpeningHoursFormValues): Promise<void> => {
    if (!resource) {
      throw new Error('Resource not found');
    }

    return api
      .postDatePeriod(formValuesToHolidayPeriod(resource.id, values))
      .then(() => {
        toast.success({
          dataTestId: 'holiday-form-success',
          label: 'Aukiolon lisääminen onnistui',
          text: `${values.name.fi} aukiolon lisääminen onnistui`,
        });

        return fetchValues(resource.id);
      })
      .catch(() => {
        toast.error({
          dataTestId: 'holiday-form-error',
          label: 'Aukiolon lisääminen epäonnistui',
          text: `${values.name.fi} aukiolon lisääminen epäonnistui`,
        });
      });
  };

  const update = async (values: OpeningHoursFormValues): Promise<void> => {
    if (!resource || !values || !values.id) {
      throw new Error('Resource or period not found');
    }

    return api
      .putDatePeriod(formValuesToHolidayPeriod(resource.id, values))
      .then(() => {
        toast.success({
          dataTestId: 'holiday-form-success',
          label: 'Tallennus onnistui',
          text: `${values.name.fi} aukiolon tallennus onnistui`,
        });

        return fetchValues(resource.id);
      })
      .catch(() => {
        toast.error({
          dataTestId: 'holiday-form-success-error',
          label: 'Tallennus epäonnistui',
          text: `${values.name.fi} aukiolon tallennus epäonnistui`,
        });
      });
  };

  const deletePeriod = async (
    values: OpeningHoursFormValues
  ): Promise<void> => {
    if (!resource) {
      throw new Error('Resource not found');
    }

    if (!values.id) {
      throw new Error('Period not found');
    }

    return api
      .deleteDatePeriod(values.id)
      .then(() => {
        toast.success({
          dataTestId: 'holiday-form-success',
          label: 'Poistaminen onnistui',
          text: `${values.name.fi} aukiolon poisto onnistui`,
        });

        return fetchValues(resource.id);
      })
      .catch(() => {
        toast.error({
          dataTestId: 'holiday-form-success-error',
          label: 'Poistaminen epäonnistui',
          text: `${values.name.fi} aukiolon poisto epäonnistui`,
        });
      });
  };

  const isMobile = useMobile();
  const returnToResourcePage = useReturnToResourcePage();

  useEffect((): void => {
    const fetchHolidayValues = async (): Promise<void> => {
      try {
        if (resource) {
          await fetchValues(resource.id);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(
          'Fetching data failed in holidays page - apiDatePeriods:',
          e
        );
      }
    };

    fetchHolidayValues();
  }, [fetchValues, holidays, resource]);

  if (!resource || !datePeriodConfig || !holidayValues) {
    return <h1>Ladataan...</h1>;
  }

  return (
    <>
      <ResourceTitle language={language} resource={resource}>
        <SecondaryButton
          onClick={returnToResourcePage}
          size={isMobile ? 'small' : 'default'}>
          Palaa etusivulle
        </SecondaryButton>
      </ResourceTitle>
      <div className="holidays-page card">
        <div className="holidays-page-title">
          <h3>Juhlapyhien aukioloajat</h3>
          {holidays.length > 0 && (
            <UpcomingHolidayNotification
              datePeriodConfig={datePeriodConfig}
              datePeriods={holidayPeriods}
              holiday={holidays[0]}
            />
          )}
        </div>
        <p>
          Jos lisäät listassa olevalle juhlapyhälle poikkeavan aukioloajan, se
          on voimassa toistaiseksi. Muista tarkistaa vuosittain, että tieto
          pitää yhä paikkansa.
        </p>
        <ul className="holidays-list">
          {holidays.map((holiday) => {
            const value: OpeningHoursFormValues | undefined = holidayValues
              ? holidayValues.find(
                  (holidayValue) => holidayValue.name.fi === holiday.name
                )
              : undefined;

            return (
              <HolidayListItem
                key={`${holiday.date}-${value ? value.id : 'new'}`}
                holiday={holiday}
                datePeriodConfig={datePeriodConfig}
                value={value}
                actions={{ create, update, delete: deletePeriod }}
              />
            );
          })}
        </ul>
      </div>
    </>
  );
}
