import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SaveToCollectionModal.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import PlusIcon from '@/icons/plus.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
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
  onClose?: () => void;
  verseKey: string;
};

const SaveToCollectionModal = ({
  isOpen,
  collections,
  onCollectionToggled,
  onNewCollectionCreated,
  onClose,
  verseKey,
}: SaveToCollectionModalProps) => {
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentModalRef = useRef<ContentModalHandles>();
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

  const handleCheckboxChange = (collection: Collection) => (checked: boolean) => {
    const eventData = {
      verseKey,
      collectionId: collection.id,
    };
    if (checked) {
      logEvent('ayah_added_to_collection_checkbox', eventData);
    } else {
      logEvent('ayah_removed_from_collection_checkbox', eventData);
    }
    onCollectionToggled(collection, checked);
  };

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<p className={styles.header}>{t('quran-reader:save-to')}</p>}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.SMALL}
    >
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
        {isAddingNewCollection ? (
          <div className={styles.newCollectionFormContainer}>
            <FormBuilder
              formFields={[
                {
                  field: 'name',
                  placeholder: t('quran-reader:new-collection-name'),
                  rules: [{ type: RuleType.Required, value: true, errorMessage: 'Required' }],
                  type: FormFieldType.Text,
                },
              ]}
              actionText={t('common:submit')}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        ) : (
          <Button variant={ButtonVariant.Ghost} prefix={<PlusIcon />} onClick={onAddNewCollection}>
            {t('quran-reader:add-collection')}
          </Button>
        )}
      </div>
    </ContentModal>
  );
};

export default SaveToCollectionModal;
