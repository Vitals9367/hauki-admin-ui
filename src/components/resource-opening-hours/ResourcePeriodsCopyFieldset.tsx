import React, { useState } from 'react';
import { Notification, IconCopy } from 'hds-react';
import api from '../../common/utils/api/api';
import {
  formatDate,
  datetimeFormFormat,
} from '../../common/utils/date-time/format';
import { useAppContext } from '../../App-context';
import { PrimaryButton } from '../button/Button';
import toast from '../notification/Toast';

export type TargetResourcesProps = {
  mainResourceName?: string;
  mainResourceId?: number;
  targetResources?: string[];
  modified?: string;
};

export default function ResourcePeriodsCopyFieldset({
  mainResourceName,
  mainResourceId,
  targetResources = [],
  onChange,
  modified,
}: TargetResourcesProps & {
  onChange: (value: TargetResourcesProps | undefined) => void;
}): JSX.Element {
  const { hasOpenerWindow, closeAppWindow } = useAppContext();
  const [isCopyLoading, setIsCopyLoading] = useState<boolean>(false);

  const copyDatePeriods = async (): Promise<void> => {
    setIsCopyLoading(true);

    if (!mainResourceId || targetResources.length === 0) {
      return;
    }

    try {
      await api.copyDatePeriods(mainResourceId, targetResources);
      toast.success({
        dataTestId: 'period-copy-success',
        label: 'Aukiolotietojen kopiointi onnistui',
        text: 'Voit tarvittaessa kopioida aukiolotiedot uudelleen',
      });
      onChange({
        mainResourceName,
        mainResourceId,
        targetResources,
        modified: new Date().toJSON(),
      });
      setIsCopyLoading(false);
      if (closeAppWindow) {
        closeAppWindow();
      }
    } catch (err) {
      toast.error({
        dataTestId: 'period-copy-error',
        label: 'Aukiolotietojen kopointi epäonnistui',
        text: 'Yritä myöhemmin uudelleen',
      });
      setIsCopyLoading(false);

      // eslint-disable-next-line no-console
      console.error(err); // For debug purposes
    }
  };

  return (
    <div className="resource-copy-date-periods">
      <Notification
        type="alert"
        label={`Olet valinnut joukkopäivityksessä ${
          (targetResources?.length || 0) + 1
        } pistettä. Klikkasit "${mainResourceName}"n aukiolotietoa. Sinulle on auennut ”${mainResourceName}”n aukiolotieto muokattavaksi.`}>
        <p>{`Kun olet muokannut ${mainResourceName}n aukiolotietoa, paina alla olevaa painiketta. Aukiolotieto päivittyy joukkopäivityksessä valitsemissasi toimipisteissä.`}</p>
        <PrimaryButton
          iconLeft={<IconCopy aria-hidden />}
          isLoading={isCopyLoading}
          loadingText="Aukiolotietoja kopioidaan"
          onClick={(): void => {
            copyDatePeriods();
          }}>{`Päivitä aukiolotiedot ${
          targetResources?.length
        } muuhun toimipisteeseen${
          hasOpenerWindow ? '. Ikkuna sulkeutuu.' : ''
        }`}</PrimaryButton>
        {modified && (
          <span className="resource-copy-modified-text">{`Tiedot päivitetty ${formatDate(
            modified,
            datetimeFormFormat
          )}`}</span>
        )}
      </Notification>
    </div>
  );
}
