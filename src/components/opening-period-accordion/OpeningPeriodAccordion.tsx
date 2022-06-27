import {
  IconAngleDown,
  IconAngleUp,
  IconPenLine,
  IconTrash,
  StatusLabel,
  useAccordion,
} from 'hds-react';
import React, { ReactNode } from 'react';
import { useAppContext } from '../../App-context';
import { Language } from '../../common/lib/types';
import { displayLangVersionNotFound } from '../language-select/LanguageSelect';
import { ConfirmationModal, useModal } from '../modal/ConfirmationModal';
import toast from '../notification/Toast';

type Props = {
  children: ReactNode;
  dateRange: ReactNode;
  id?: number;
  initiallyOpen?: boolean;
  isActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
  periodName?: string | null;
};

const OpeningPeriodAccordion = ({
  children,
  dateRange,
  id,
  initiallyOpen = false,
  isActive = false,
  onDelete,
  onEdit,
  periodName,
}: Props): JSX.Element => {
  const deleteModalTitle = 'Oletko varma että haluat poistaa aukiolojakson?';
  const DeleteModalText = (): JSX.Element => (
    <>
      <p>Olet poistamassa aukiolojakson</p>
      <p>
        <b>
          {periodName}
          <br />
          {dateRange}
        </b>
      </p>
    </>
  );
  const { language = Language.FI } = useAppContext();
  const { isModalOpen, openModal, closeModal } = useModal();
  const { buttonProps, isOpen } = useAccordion({
    initiallyOpen,
  });
  const AccordionIcon = (): JSX.Element =>
    isOpen ? <IconAngleUp aria-hidden /> : <IconAngleDown aria-hidden />;

  return (
    <div className="opening-period" data-test={`openingPeriod-${id}`}>
      <div className="opening-period-header">
        <div className="opening-period-title opening-period-header-column">
          {periodName ? (
            <h4>{periodName}</h4>
          ) : (
            <h4 className="text-danger">
              {displayLangVersionNotFound({
                language,
                label: 'aukiolojakson nimi',
              })}
            </h4>
          )}
        </div>
        <div className="opening-period-dates opening-period-header-column">
          <div>{dateRange}</div>
          {isActive && (
            <StatusLabel className="opening-period-dates-status" type="info">
              Voimassa nyt
            </StatusLabel>
          )}
        </div>
        <div className="opening-period-actions opening-period-header-column">
          <div>
            {onEdit && (
              <button
                className="opening-period-edit-link button-icon"
                data-test={`openingPeriodEditLink-${id}`}
                onClick={onEdit}
                type="button">
                <IconPenLine aria-hidden="true" />
                <span className="hiddenFromScreen">{`Muokkaa ${
                  periodName || 'nimettömän'
                } aukiolojakson tietoja`}</span>
              </button>
            )}
            {onDelete && (
              <button
                className="opening-period-delete-link button-icon"
                data-test={`openingPeriodDeleteLink-${id}`}
                type="button"
                onClick={openModal}>
                <IconTrash aria-hidden="true" />
                <span className="hiddenFromScreen">{`Poista ${
                  periodName || 'nimetön'
                } aukiolojakso`}</span>
              </button>
            )}
          </div>
          <button
            className="button-icon"
            data-test={`openingPeriodAccordionButton-${id}`}
            type="button"
            {...buttonProps}>
            <AccordionIcon />
            <span className="hiddenFromScreen">{`Näytä aukioloajat jaksosta ${
              periodName || 'nimetön'
            } aukiolojakso`}</span>
          </button>
        </div>
        <ConfirmationModal
          onConfirm={async (): Promise<void> => {
            if (onDelete) {
              try {
                await onDelete();
                toast.success({
                  label: 'Aukiolo poistettu onnistuneesti',
                  text: `Aukiolo "${periodName}" poistettu onnistuneesti.`,
                  dataTestId: 'date-period-delete-success',
                });
              } catch (_) {
                toast.error({
                  label: 'Aukiolon poisto epäonnistui',
                  text:
                    'Aukiolon poisto epäonnistui. Yritä myöhemmin uudelleen.',
                });
              }
            }
          }}
          title={deleteModalTitle}
          text={<DeleteModalText />}
          isOpen={isModalOpen}
          close={closeModal}
          confirmText="Poista"
        />
      </div>
      {isOpen && children}
    </div>
  );
};

export default OpeningPeriodAccordion;
