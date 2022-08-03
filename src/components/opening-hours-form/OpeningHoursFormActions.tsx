import React from 'react';
import useMobile from '../../hooks/useMobile';
import useReturnToResourcePage from '../../hooks/useReturnToResourcePage';
import { PrimaryButton, SecondaryButton } from '../button/Button';
import './OpeningHoursFormActions.scss';

type Props = {
  isSaving: boolean;
};

const OpeningHoursFormActions = ({ isSaving }: Props): JSX.Element => {
  const isMobile = useMobile();
  const returnToResourcePage = useReturnToResourcePage();

  return (
    <div className="opening-hours-form-actions-container">
      <div className="card opening-hours-form-actions">
        <PrimaryButton
          dataTest="submit-opening-hours-button"
          isLoading={isSaving}
          loadingText="Tallentaa aukioloaikoja"
          type="submit"
          size={isMobile ? 'small' : 'default'}>
          Tallenna
        </PrimaryButton>
        <SecondaryButton
          onClick={returnToResourcePage}
          size={isMobile ? 'small' : 'default'}>
          Peruuta
        </SecondaryButton>
      </div>
    </div>
  );
};

export default OpeningHoursFormActions;
