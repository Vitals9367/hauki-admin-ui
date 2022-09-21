import React, { useEffect, useState } from 'react';
import { LoadingSpinner, Notification } from 'hds-react';
import { useHistory } from 'react-router-dom';
import { partition } from 'lodash';
import {
  ApiDatePeriod,
  Language,
  DatePeriod,
  Resource,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import { PrimaryButton, SecondaryButton } from '../button/Button';
import OpeningPeriod from './opening-period/OpeningPeriod';
import './ResourceOpeningHours.scss';
import {
  apiDatePeriodToDatePeriod,
  getActiveDatePeriod,
  isHoliday,
} from '../../common/helpers/opening-hours-helpers';
import { getDatePeriodFormConfig } from '../../services/datePeriodFormConfig';
import HolidaysTable from '../holidays-table/HolidaysTable';
import { getHolidays } from '../../services/holidays';
import OpeningPeriodAccordion from '../opening-period-accordion/OpeningPeriodAccordion';
import ExceptionOpeningHours from '../exception-opening-hours/ExceptionOpeningHours';

const OpeningPeriodsNotFound = ({ text }: { text: string }): JSX.Element => (
  <p className="opening-periods-not-found">{text}</p>
);

const ExceptionPeriodsList = ({
  datePeriodConfig,
  datePeriods,
  deletePeriod,
  language,
  parentId,
  resourceId,
  isLoading,
  holidaysTableInitiallyOpen,
}: {
  datePeriodConfig?: UiDatePeriodConfig;
  datePeriods: DatePeriod[];
  deletePeriod: (id: number) => Promise<void>;
  language: Language;
  parentId?: number;
  resourceId: number;
  isLoading: boolean;
  holidaysTableInitiallyOpen: boolean;
}): JSX.Element => {
  const history = useHistory();
  const holidays = getHolidays();
  const [holidayDatePeriods, exceptions] = partition(
    datePeriods,
    (datePeriod) => isHoliday(datePeriod, holidays)
  );

  return (
    <>
      <section className="opening-periods-section">
        <header className="exception-periods-header">
          <h3 className="exception-periods-title">Poikkeavat päivät</h3>
          <PrimaryButton
            dataTest="add-new-exception-period-button"
            onClick={() => {
              if (parentId) {
                history.push(
                  `/resource/${parentId}/child/${resourceId}/exception/new`
                );
              } else {
                history.push(`/resource/${resourceId}/exception/new`);
              }
            }}
            size="small">
            Lisää poikkeava päivä +
          </PrimaryButton>
        </header>
        {isLoading ? (
          <div className="loading-spinner-container">
            <LoadingSpinner loadingText="Haetaan aukioloja" small />
          </div>
        ) : (
          <ul className="opening-periods-list">
            {exceptions.length === 0 ? (
              <li>
                <OpeningPeriodsNotFound text="Ei poikkeavia päiviä. Voit lisätä poikkeavan päivän painamalla “Lisää poikkeava päivä“ -painiketta." />
              </li>
            ) : (
              exceptions.map((exception, i) => (
                <li key={exception.id}>
                  <OpeningPeriodAccordion
                    editUrl={
                      parentId
                        ? `/resource/${parentId}/child/${resourceId}/exception/${exception.id}`
                        : `/resource/${resourceId}/exception/${exception.id}`
                    }
                    initiallyOpen={i <= 10}
                    onDelete={() => {
                      if (exception.id) {
                        deletePeriod(exception.id);
                      }
                    }}
                    periodName={exception.name[language]}
                    dateRange={`${
                      exception.startDate ?? ''
                    } — poikkeavat aukiolot`}>
                    <ExceptionOpeningHours
                      datePeriod={exception}
                      datePeriodConfig={datePeriodConfig}
                    />
                  </OpeningPeriodAccordion>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
      <section>
        <header className="exception-periods-header">
          <h3 className="exception-periods-title">Juhlapyhät</h3>
        </header>
        {isLoading && exceptions.length === 0 ? (
          <div className="loading-spinner-container">
            <LoadingSpinner loadingText="Haetaan aukioloja" small />
          </div>
        ) : (
          <ul className="opening-periods-list">
            <li>
              <HolidaysTable
                datePeriodConfig={datePeriodConfig}
                datePeriods={holidayDatePeriods}
                holidays={holidays}
                initiallyOpen={holidaysTableInitiallyOpen}
                parentId={parentId}
                resourceId={resourceId}
              />
            </li>
          </ul>
        )}
      </section>
    </>
  );
};

enum PeriodsListTheme {
  DEFAULT = 'DEFAULT',
  LIGHT = 'LIGHT',
}

const OpeningPeriodsList = ({
  id,
  parentId,
  addNewOpeningPeriodButtonDataTest,
  resourceId,
  title,
  datePeriods,
  datePeriodConfig,
  theme,
  notFoundLabel,
  deletePeriod,
  language,
  isLoading,
}: {
  id: string;
  parentId?: number;
  addNewOpeningPeriodButtonDataTest?: string;
  resourceId: number;
  title: string;
  datePeriods: DatePeriod[];
  datePeriodConfig?: UiDatePeriodConfig;
  theme: PeriodsListTheme;
  notFoundLabel: string;
  deletePeriod: (id: number) => Promise<void>;
  language: Language;
  isLoading: boolean;
}): JSX.Element => {
  const openingPeriodsHeaderClassName =
    theme === PeriodsListTheme.LIGHT
      ? 'opening-periods-header-light'
      : 'opening-periods-header';

  const history = useHistory();
  const currentDatePeriod = getActiveDatePeriod(
    new Date().toISOString().split('T')[0],
    datePeriods
  );

  return (
    <section className="opening-periods-section">
      <header className={openingPeriodsHeaderClassName}>
        <h2 className="opening-periods-header-title">{title}</h2>
        <p className="period-count">{datePeriods.length} aukioloaikaa</p>
        <SecondaryButton
          dataTest={addNewOpeningPeriodButtonDataTest}
          size="small"
          className="opening-period-header-button"
          light
          onClick={(): void => {
            if (parentId) {
              history.push(
                `/resource/${parentId}/child/${resourceId}/period/new`
              );
            } else {
              history.push(`/resource/${resourceId}/period/new`);
            }
          }}>
          Lisää aukioloaika +
        </SecondaryButton>
      </header>
      {isLoading && datePeriods.length === 0 && (
        <div className="loading-spinner-container">
          <LoadingSpinner loadingText="Haetaan aukiolojoja" small />
        </div>
      )}
      {datePeriodConfig && (
        <ul className="opening-periods-list" data-test={id}>
          {datePeriods.length > 0 ? (
            datePeriods.map((datePeriod: DatePeriod, index) => (
              <li key={datePeriod.id}>
                <OpeningPeriod
                  current={currentDatePeriod === datePeriod}
                  datePeriodConfig={datePeriodConfig}
                  datePeriod={datePeriod}
                  resourceId={resourceId}
                  language={language}
                  deletePeriod={deletePeriod}
                  initiallyOpen={index <= 10}
                  parentId={parentId}
                />
              </li>
            ))
          ) : (
            <li>
              <OpeningPeriodsNotFound text={notFoundLabel} />
            </li>
          )}
        </ul>
      )}
    </section>
  );
};

export default function ResourceOpeningHours({
  language,
  parentId,
  resource,
  holidaysTableInitiallyOpen = false,
}: {
  language: Language;
  parentId?: number;
  resource: Resource;
  holidaysTableInitiallyOpen?: boolean;
}): JSX.Element | null {
  const resourceId = resource.id;
  const [error, setError] = useState<Error | undefined>(undefined);
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const [[defaultPeriods, exceptions], setDividedDatePeriods] = useState<
    [ApiDatePeriod[], ApiDatePeriod[]]
  >([[], []]);
  const [isLoading, setLoading] = useState(false);
  const fetchDatePeriods = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const [apiDatePeriods, uiDatePeriodOptions] = await Promise.all([
        api.getDatePeriods(id),
        getDatePeriodFormConfig(),
      ]);
      const datePeriodLists = partition(
        apiDatePeriods,
        (datePeriod) => !datePeriod.override
      );
      setDividedDatePeriods(datePeriodLists);
      setDatePeriodConfig(uiDatePeriodOptions);
    } catch (e) {
      setError(e as Error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDatePeriods(resourceId);
  }, [resourceId]);

  const deletePeriod = async (datePeriodId: number): Promise<void> => {
    await api.deleteDatePeriod(datePeriodId);
    fetchDatePeriods(resourceId);
  };

  if (error) {
    return (
      <>
        <h1 className="resource-info-title">Virhe</h1>
        <Notification
          label="Toimipisteen aukiolojaksoja ei saatu ladattua."
          type="error">
          Tarkista toimipiste-id.
        </Notification>
      </>
    );
  }

  return (
    <>
      <OpeningPeriodsList
        id="resource-opening-periods-list"
        parentId={parentId}
        addNewOpeningPeriodButtonDataTest="add-new-opening-period-button"
        resourceId={resourceId}
        title="Aukioloajat"
        datePeriods={defaultPeriods.map(apiDatePeriodToDatePeriod)}
        datePeriodConfig={datePeriodConfig}
        theme={PeriodsListTheme.DEFAULT}
        notFoundLabel="Ei määriteltyjä aukioloaikoja. Aloita painamalla “Lisää aukioloaika” -painiketta."
        deletePeriod={deletePeriod}
        language={language}
        isLoading={isLoading}
      />
      <ExceptionPeriodsList
        datePeriodConfig={datePeriodConfig}
        datePeriods={exceptions.map(apiDatePeriodToDatePeriod)}
        deletePeriod={deletePeriod}
        language={language}
        parentId={parentId}
        resourceId={resourceId}
        isLoading={isLoading}
        holidaysTableInitiallyOpen={holidaysTableInitiallyOpen}
      />
    </>
  );
}
