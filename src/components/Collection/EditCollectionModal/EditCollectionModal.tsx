import React, { useCallback, useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './EditCollectionModal.module.scss';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';

type EditCollectionModalProps = {
  isOpen: boolean;
  defaultValue: string;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
};

const EditCollectionModal = ({
  isOpen,
  defaultValue,
  onClose,
  onSubmit,
}: EditCollectionModalProps) => {
  const { t } = useTranslation('collection');
  const { t: commonT } = useTranslation('common');
  const [name, setName] = useState(defaultValue);

  useEffect(() => {
    setName(defaultValue);
  }, [defaultValue, isOpen]);

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({ name: trimmedName });
  }, [name, onSubmit]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} isBottomSheetOnMobile={false}>
      <Modal.Body>
        <div className={styles.header}>{t('edit-collection')}</div>

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
          />
        </div>

        <div className={styles.footer}>
          <Button
            type={ButtonType.Secondary}
            size={ButtonSize.Medium}
            onClick={onClose}
            className={styles.cancelButton}
          >
            {commonT('cancel')}
          </Button>
          <Button
            type={ButtonType.Primary}
            size={ButtonSize.Medium}
            onClick={handleSubmit}
            isDisabled={!name.trim()}
            className={styles.saveButton}
          >
            {commonT('edit')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditCollectionModal;
