import React, { ReactNode, useState } from 'react';
import { Dialog, IconQuestionCircle } from 'hds-react';
import { PrimaryButton, SecondaryButton } from '../button/Button';

type UseModalProps = {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useModal = (): UseModalProps => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = (): void => setIsModalOpen(true);
  const closeModal = (): void => setIsModalOpen(false);
  return {
    isModalOpen,
    openModal,
    closeModal,
  };
};

export function ConfirmationModal({
  confirmText,
  isOpen,
  onClose,
  onConfirm,
  text,
  title,
}: {
  confirmText: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text: string | ReactNode;
  title: string;
}): JSX.Element | null {
  const titleId = 'confirmation-modal-title';

  return (
    <Dialog aria-labelledby={titleId} id="confirmation-modal" isOpen={isOpen}>
      <Dialog.Header
        id={titleId}
        title={title}
        iconLeft={<IconQuestionCircle aria-hidden="true" />}
      />
      <Dialog.Content>{text}</Dialog.Content>
      <Dialog.ActionButtons>
        <PrimaryButton onClick={onConfirm}>{confirmText}</PrimaryButton>
        <SecondaryButton onClick={onClose}>Peruuta</SecondaryButton>
      </Dialog.ActionButtons>
    </Dialog>
  );
}
