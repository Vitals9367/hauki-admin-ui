import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Resource,
  UiDatePeriodConfig,
  ResourceState,
} from '../../../common/lib/types';
import api from '../../../common/utils/api/api';
import toast from '../../../components/notification/Toast';
import { openingHoursToApiDatePeriod } from '../helpers/opening-hours-helpers';
import OpeningHoursForm from '../form/OpeningHoursForm';
import { OpeningHoursFormState } from '../types';

export default function CreateNewOpeningPeriodPage({
  resourceId,
}: {
  resourceId: string;
}): JSX.Element {
  const history = useHistory();
  const [resource, setResource] = useState<Resource>();
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const [isSaving, setSaving] = useState(false);

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const [apiResource, uiDatePeriodOptions] = await Promise.all([
          api.getResource(resourceId),
          api.getDatePeriodFormConfig(),
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

  if (!resource || !datePeriodConfig) {
    return <h1>Ladataan...</h1>;
  }

  const returnToResourcePage = (): void =>
    history.push(`/resource/${resource.id}`);

  const onSubmit = (data: OpeningHoursFormState): void => {
    if (!resource) {
      throw new Error('Resource not found');
    }
    setSaving(true);
    api
      .postDatePeriod(
        openingHoursToApiDatePeriod(resource?.id, data.openingHours)
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

  return (
    <OpeningHoursForm
      datePeriodConfig={datePeriodConfig}
      onCancel={returnToResourcePage}
      isSaving={isSaving}
      onSubmit={onSubmit}
      resource={resource}
      resourceStates={resourceStates}
    />
  );
}
