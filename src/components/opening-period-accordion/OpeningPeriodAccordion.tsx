import {
  IconAngleDown,
  IconAngleUp,
  IconPenLine,
  IconTrash,
  StatusLabel,
  useAccordion,
} from 'hds-react';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../App-context';
import { Language } from '../../common/lib/types';
import { displayLangVersionNotFound } from '../language-select/LanguageSelect';
import { ConfirmationModal, useModal } from '../modal/ConfirmationModal';
import toast from '../notification/Toast';

type Props = {
  children: ReactNode;
  dateRange: ReactNode;
  editUrl?: string;
  id?: number;
  initiallyOpen?: boolean;
  isActive?: boolean;
  onDelete?: () => void | Promise<void>;
  periodName?: string | null;
};

const OpeningPeriodAccordion = ({
  children,
  dateRange,
  editUrl,
  id,
  initiallyOpen = false,
  isActive = false,
  onDelete,
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
            <h3>{periodName}</h3>
          ) : (
            <h3 className="text-danger">
              {displayLangVersionNotFound({
                language,
                label: 'aukiolojakson nimi',
              })}
            </h3>
          )}
        </div>
        <div className="opening-period-dates opening-period-header-column">
          {dateRange}
          {isActive && (
            <StatusLabel className="opening-period-dates-status" type="info">
              Voimassa nyt
            </StatusLabel>
          )}
        </div>
        <div className="opening-period-actions opening-period-header-column">
          <div>
            {editUrl && (
              <Link
                className="opening-period-edit-link button-icon"
                data-test={`openingPeriodEditLink-${id}`}
                to={editUrl}
                type="button">
                <IconPenLine aria-hidden="true" />
                <span className="hiddenFromScreen">{`Muokkaa ${
                  periodName || 'nimettömän'
                } aukiolojakson tietoja`}</span>
              </Link>
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
          onClose={closeModal}
          confirmText="Poista"
        />
      </div>
      {isOpen && children}
    </div>
  );
};

export default OpeningPeriodAccordion;
