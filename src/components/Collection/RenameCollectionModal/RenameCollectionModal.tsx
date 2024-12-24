/* eslint-disable i18next/no-literal-string */

import useTranslation from 'next-translate/useTranslation';

import styles from './RenameCollectionModal.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Modal from '@/dls/Modal/Modal';
import { RuleType } from 'types/FieldRule';
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
                rules: [{ type: RuleType.Required, value: true, errorMessage: 'Required' }],
                type: FormFieldType.Text,
              },
            ]}
            actionText={t('common:submit')}
            onSubmit={onSubmit}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RenameCollectionModal;
