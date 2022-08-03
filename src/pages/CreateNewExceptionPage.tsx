import React, { useEffect, useState } from 'react';
import { Resource, UiDatePeriodConfig } from '../common/lib/types';
import api from '../common/utils/api/api';
import ExceptionOpeningHoursForm from '../components/exception-opening-hours-form/ExceptionOpeningHoursForm';
import { getDatePeriodFormConfig } from '../services/datePeriodFormConfig';

export default function CreateNewExceptionPage({
  resourceId,
}: {
  resourceId: string;
}): JSX.Element {
  const [resource, setResource] = useState<Resource>();
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const [apiResource, uiDatePeriodOptions] = await Promise.all([
          api.getResource(resourceId),
          getDatePeriodFormConfig(),
        ]);
        setResource(apiResource);
        setDatePeriodConfig(uiDatePeriodOptions);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Add date-period - data initialization error:', e);
      }
    };

    fetchData();
  }, [resourceId]);

  if (!resource || !datePeriodConfig) {
    return <h1>Ladataan...</h1>;
  }

  return (
    <ExceptionOpeningHoursForm
      datePeriodConfig={datePeriodConfig}
      resource={resource}
      submitFn={api.postDatePeriod}
    />
  );
}
