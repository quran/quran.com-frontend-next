import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SaveToCollectionModal.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import PlusIcon from '@/icons/plus.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

export type Collection = {
  id: string;
  name: string;
  checked?: boolean;
};

type SaveToCollectionModalProps = {
  isOpen: boolean;
  collections: Collection[];
  onCollectionToggled: (collection: Collection, newValue: boolean) => void;
  onNewCollectionCreated: (name: string) => Promise<void>;
  isAddingNewCollection?: boolean;
  onClose?: () => void;
};

const SaveToCollectionModal = ({
  isOpen,
  collections,
  onCollectionToggled,
  onNewCollectionCreated,
  onClose,
}: SaveToCollectionModalProps) => {
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();

  const handleSubmit = (data) => {
    setIsSubmitting(true);
    logButtonClick('save_to_collection_modal_submit');
    onNewCollectionCreated(data.name)
      .then(() => {
        onClose();
        toast(t('quran-reader:saved-to', { collectionName: data.name }), {
          status: ToastStatus.Success,
        });
        return setIsAddingNewCollection(false);
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  const onAddNewCollection = () => {
    setIsAddingNewCollection(true);
    logButtonClick('save_to_collection_add_new_collection');
  };

  const handleCheckboxChange = (collection) => (checked) =>
    onCollectionToggled(collection, checked);

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose}>
      <Modal.Body>
        <div className={styles.header}>{t('quran-reader:save-to')}</div>
        <div className={styles.collectionList}>
          {collections.map((collection) => (
            <div className={styles.collectionItem} key={collection.id}>
              <Checkbox
                id={collection.name}
                defaultChecked={collection.checked}
                label={collection.name}
                onChange={handleCheckboxChange(collection)}
              />
            </div>
          ))}
        </div>
        <div>
          {!isAddingNewCollection && (
            <Button
              variant={ButtonVariant.Ghost}
              prefix={<PlusIcon />}
              onClick={onAddNewCollection}
            >
              {t('quran-reader:add-collection')}
            </Button>
          )}

          {isAddingNewCollection && (
            <div className={styles.newCollectionFormContainer}>
              <FormBuilder
                formFields={[
                  {
                    field: 'name',
                    label: t('quran-reader:new-collection-name'),
                    rules: [{ type: RuleType.Required, value: true, errorMessage: 'Required' }],
                    type: FormFieldType.Text,
                  },
                ]}
                actionText={t('common:submit')}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SaveToCollectionModal;
