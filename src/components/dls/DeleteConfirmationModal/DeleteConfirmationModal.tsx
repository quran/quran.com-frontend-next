import type React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './DeleteConfirmationModal.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Modal from '@/dls/Modal/Modal';
import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  isCancelDisabled?: boolean;
  showCancelButton?: boolean;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  subtitle,
  description,
  children,
  onConfirm,
  onCancel,
  onBack,
  isLoading = false,
  isConfirmDisabled = false,
  isCancelDisabled = false,
  showCancelButton = true,
  confirmLabel,
  cancelLabel,
}) => {
  const { t } = useTranslation('common');

  const closeLabel = t('close');
  const backLabel = t('back');
  const resolvedCancelLabel = cancelLabel || t('cancel');
  const resolvedConfirmLabel = confirmLabel || t('delete');

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={onCancel}
      onEscapeKeyDown={onCancel}
      contentClassName={styles.modal}
    >
      <Modal.Body>
        <div className={styles.container}>
          <div className={styles.header}>
            <Modal.Title>
              {onBack ? (
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={onBack}
                  disabled={isLoading}
                  aria-disabled={isLoading}
                  aria-label={backLabel}
                >
                  <IconContainer
                    icon={<ArrowIcon />}
                    shouldForceSetColors={false}
                    size={IconSize.Custom}
                    className={styles.arrowIcon}
                  />
                  <span className={styles.title}>{title}</span>
                </button>
              ) : (
                <span className={styles.title}>{title}</span>
              )}
            </Modal.Title>
            <button
              type="button"
              className={styles.closeButton}
              disabled={isLoading}
              onClick={onCancel}
              aria-disabled={isLoading}
              aria-label={closeLabel}
            >
              <CloseIcon />
            </button>
          </div>

          <hr className={styles.divider} />

          <div className={styles.content}>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {description && <p className={styles.description}>{description}</p>}
            {children}
          </div>

          <hr className={styles.divider} />

          <div className={styles.footer}>
            {showCancelButton && (
              <Button
                variant={ButtonVariant.Outlined}
                size={ButtonSize.Medium}
                isDisabled={isLoading || isCancelDisabled}
                aria-disabled={isLoading || isCancelDisabled}
                onClick={onCancel}
                className={styles.cancelButton}
              >
                {resolvedCancelLabel}
              </Button>
            )}
            <Button
              type={ButtonType.Error}
              size={ButtonSize.Medium}
              onClick={onConfirm}
              className={styles.deleteButton}
              isLoading={isLoading}
              isDisabled={isLoading || isConfirmDisabled}
              aria-disabled={isLoading || isConfirmDisabled}
            >
              {resolvedConfirmLabel}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmationModal;
