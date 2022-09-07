import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SaveToCollectionModal.module.scss';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Modal from '@/dls/Modal/Modal';
import PlusIcon from '@/icons/plus.svg';
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
  const { t } = useTranslation();

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
                onChange={(checked) => onCollectionToggled(collection, checked)}
              />
            </div>
          ))}
        </div>
        <div>
          {!isAddingNewCollection && (
            <Button
              variant={ButtonVariant.Ghost}
              prefix={<PlusIcon />}
              onClick={() => setIsAddingNewCollection(true)}
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
                onSubmit={(data: any) => {
                  onNewCollectionCreated(data.name).then(() => setIsAddingNewCollection(false));
                }}
              />
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SaveToCollectionModal;
