import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './collections.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import CloseIcon from '@/icons/close.svg';

interface NewCollectionFormProps {
  newCollectionName: string;
  isSubmittingCollection: boolean;
  onNameChange: (name: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onCreate: () => Promise<void>;
  onClose: () => void;
}

/**
 * Form component for creating a new collection
 * Handles user input and submission
 * @returns {React.FC<NewCollectionFormProps>} The NewCollectionForm component
 */
const NewCollectionForm: React.FC<NewCollectionFormProps> = ({
  newCollectionName,
  isSubmittingCollection,
  onNameChange,
  onBack,
  onCancel,
  onCreate,
  onClose,
}) => {
  const { t } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter' && newCollectionName.trim()) {
        onCreate();
      }
    },
    [newCollectionName, onCreate],
  );

  return (
    <div className={styles.newCollectionContainer}>
      <div className={styles.newCollectionHeader}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label={commonT('back')}
        >
          <ChevronLeftIcon />
        </button>
        <span className={styles.newCollectionTitle}>{t('new-collection')}</span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={commonT('close')}
        >
          <CloseIcon />
        </button>
      </div>

      <div className={styles.newCollectionForm}>
        <label htmlFor="collection-name" className={styles.inputLabel}>
          {commonT('form.title')}:
        </label>
        <input
          id="collection-name"
          type="text"
          className={styles.collectionInput}
          value={newCollectionName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=""
        />
      </div>

      <div className={styles.newCollectionFooter}>
        <Button
          variant={ButtonVariant.Outlined}
          size={ButtonSize.Medium}
          onClick={onCancel}
          className={styles.cancelButton}
        >
          {commonT('cancel')}
        </Button>
        <Button
          type={ButtonType.Primary}
          size={ButtonSize.Medium}
          onClick={onCreate}
          className={styles.createButton}
          isDisabled={!newCollectionName.trim() || isSubmittingCollection}
          isLoading={isSubmittingCollection}
        >
          {commonT('create')}
        </Button>
      </div>
    </div>
  );
};

export default NewCollectionForm;
