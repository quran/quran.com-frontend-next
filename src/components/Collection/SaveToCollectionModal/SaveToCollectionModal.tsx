import { useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import getNewCollectionNameFormFields from './getNewCollectionNameFormFields';
import styles from './SaveToCollectionModal.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import modalStyles from '@/components/Notes/modal/Modal.module.scss';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ArrowIcon from '@/icons/arrow.svg';
import PlusIcon from '@/icons/plus.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

export type CollectionOption = {
  id: string;
  name: string;
  checked?: boolean;
};

type SaveToCollectionModalProps = {
  isOpen: boolean;
  collections: CollectionOption[];
  onCollectionToggled: (collection: CollectionOption, newValue: boolean) => void;
  onNewCollectionCreated: (name: string) => Promise<void>;
  onClose?: () => void;
  verseKey: string;
  onBack?: () => void;
};

const SaveToCollectionModal = ({
  isOpen,
  collections,
  onCollectionToggled,
  onNewCollectionCreated,
  onClose,
  verseKey,
  onBack,
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

  const handleCheckboxChange = (collection: CollectionOption) => (checked: boolean) => {
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
      header={
        onBack ? (
          <button
            type="button"
            className={classNames(modalStyles.headerButton, modalStyles.title)}
            onClick={onBack}
          >
            <IconContainer
              icon={<ArrowIcon />}
              shouldForceSetColors={false}
              size={IconSize.Custom}
              className={modalStyles.arrowIcon}
            />
            {t('quran-reader:save-to')}
          </button>
        ) : (
          <p className={styles.header}>{t('quran-reader:save-to')}</p>
        )
      }
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
              checked={collection.checked}
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
              formFields={getNewCollectionNameFormFields(t)}
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
