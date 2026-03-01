import React, { useCallback, useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './EditCollectionModal.module.scss';

import {
  COLLECTION_NAME_MAX_LENGTH,
  COLLECTION_NAME_MIN_LENGTH,
} from '@/components/Collection/collectionNameValidation';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';
import { ContentSide } from '@/dls/Tooltip';
import CloseIcon from '@/icons/close.svg';

interface EditCollectionModalProps {
  isOpen: boolean;
  defaultValue: string;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
}

const EditCollectionModal: React.FC<EditCollectionModalProps> = ({
  isOpen,
  defaultValue,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation('collection');
  const { t: commonT } = useTranslation('common');
  const [name, setName] = useState(defaultValue);
  const trimmedName = name.trim();

  const isSaveDisabled =
    trimmedName.length < COLLECTION_NAME_MIN_LENGTH ||
    trimmedName.length > COLLECTION_NAME_MAX_LENGTH;

  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
    }
  }, [defaultValue, isOpen]);

  const handleSubmit = useCallback(() => {
    if (!trimmedName) return;
    if (trimmedName.length > COLLECTION_NAME_MAX_LENGTH) return;
    onSubmit({ name: trimmedName });
  }, [onSubmit, trimmedName]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} onEscapeKeyDown={onClose}>
      <Modal.Body>
        <div className={styles.header}>
          <div className={styles.title}>{t('edit-collection')}</div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={commonT('close')}
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.formContainer}>
          <label htmlFor="edit-collection-name" className={styles.inputLabel}>
            {commonT('form.title')}:
          </label>
          <input
            id="edit-collection-name"
            className={styles.collectionInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('collection-name')}
            aria-describedby={isSaveDisabled ? 'edit-collection-name-help' : undefined}
            maxLength={COLLECTION_NAME_MAX_LENGTH}
          />
        </div>

        <div className={styles.footer}>
          <div className={styles.cancelButton}>
            <Button type={ButtonType.Secondary} size={ButtonSize.Medium} onClick={onClose}>
              {commonT('cancel')}
            </Button>
          </div>
          <div className={styles.saveButton}>
            <Button
              type={ButtonType.Primary}
              size={ButtonSize.Medium}
              onClick={handleSubmit}
              isDisabled={isSaveDisabled}
              tooltip={isSaveDisabled ? t('edit-collection-name-required') : undefined}
              tooltipContentSide={ContentSide.TOP}
            >
              {commonT('edit')}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditCollectionModal;
