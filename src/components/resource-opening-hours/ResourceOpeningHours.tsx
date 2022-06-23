import React, { useEffect, useState } from 'react';
import { Notification } from 'hds-react';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  Language,
  Resource,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import { SecondaryButton } from '../button/Button';

import OpeningPeriod from './opening-period/OpeningPeriod';
import './ResourceOpeningHours.scss';
import { getActiveDatePeriod } from '../../common/helpers/opening-hours-helpers';

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
        <h3 className="opening-periods-header-title">{title}</h3>
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

const OpeningPeriodsNotFound = ({ text }: { text: string }): JSX.Element => (
  <p className="opening-periods-not-found">{text}</p>
);

const partitionByOverride = (datePeriods: DatePeriod[]): DatePeriod[][] =>
  datePeriods.reduce(
    ([defaults = [], exceptions = []]: DatePeriod[][], current: DatePeriod) => {
      return current.override
        ? [defaults, [...exceptions, current]]
        : [[...defaults, current], exceptions];
    },
    [[], []]
  );

export default function ResourceOpeningHours({
  language,
  parentId,
  resource,
}: {
  language: Language;
  parentId?: number;
  resource: Resource;
}): JSX.Element | null {
  const resourceId = resource.id;
  const [error, setError] = useState<Error | undefined>(undefined);
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const [[defaultPeriods], setDividedDatePeriods] = useState<DatePeriod[][]>([
    [],
    [],
  ]);
  const fetchDatePeriods = async (id: number): Promise<void> => {
    try {
      const [apiDatePeriods, uiDatePeriodOptions] = await Promise.all([
        api.getDatePeriods(id),
        api.getDatePeriodFormConfig(),
      ]);
      const datePeriodLists = partitionByOverride(apiDatePeriods);
      setDividedDatePeriods(datePeriodLists);
      setDatePeriodConfig(uiDatePeriodOptions);
    } catch (e) {
      setError(e as Error);
    }
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
    <OpeningPeriodsList
      id="resource-opening-periods-list"
      parentId={parentId}
      addNewOpeningPeriodButtonDataTest="add-new-opening-period-button"
      resourceId={resourceId}
      title="Aukioloajat"
      datePeriods={defaultPeriods}
      datePeriodConfig={datePeriodConfig}
      theme={PeriodsListTheme.DEFAULT}
      notFoundLabel="Ei aukiolojaksoja."
      deletePeriod={deletePeriod}
      language={language}
    />
  );
}
