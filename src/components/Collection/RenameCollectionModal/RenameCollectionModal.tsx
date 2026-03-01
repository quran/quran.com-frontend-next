/* eslint-disable i18next/no-literal-string */

import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './RenameCollectionModal.module.scss';

import { getNewCollectionNameRules } from '@/components/Collection/SaveToCollectionModal/getNewCollectionNameFormFields';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Modal from '@/dls/Modal/Modal';
import { FormFieldType } from 'types/FormField';

export type Collection = {
  id: number | string;
  name: string;
  checked?: boolean;
};

type RenameCollectionModalProps = {
  isOpen: boolean;
  defaultValue: string;
  onSubmit: (data: any) => void;
  onClose: () => void;
};

const RenameCollectionModal = ({
  isOpen,
  onSubmit,
  defaultValue,
  onClose,
}: RenameCollectionModalProps) => {
  const { t } = useTranslation('profile');
  const fieldName = t('collection:collection-name');
  const handleSubmit = useCallback(
    (data: { name: string }) => {
      const trimmedName = data?.name?.trim();
      if (!trimmedName) return;

      onSubmit({ ...data, name: trimmedName });
    },
    [onSubmit],
  );

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} isBottomSheetOnMobile={false}>
      <Modal.Body>
        <div className={styles.header}>{t('common:rename')}</div>
        <div className={styles.newCollectionFormContainer}>
          <FormBuilder
            formFields={[
              {
                field: 'name',
                placeholder: t('quran-reader:new-collection-name'),
                defaultValue,
                rules: getNewCollectionNameRules(t, fieldName),
                type: FormFieldType.Text,
              },
            ]}
            actionText={t('common:submit')}
            onSubmit={handleSubmit}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RenameCollectionModal;
