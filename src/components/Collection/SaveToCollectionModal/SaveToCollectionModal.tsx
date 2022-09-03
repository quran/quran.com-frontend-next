import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SaveToCollectionModal.module.scss';

import PlusIcon from '@/icons/plus.svg';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Modal from '@/dls/Modal/Modal';
import FormBuilder from 'src/components/FormBuilder/FormBuilder';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

export type Collection = {
  id: string | number;
  name: string;
  checked?: boolean;
};

type SaveToCollectionModalProps = {
  isOpen: boolean;
  collections: Collection[];
  onCollectionToggled: (collection: Collection) => void;
  onNewCollectionCreated: (name: string) => void;
  isAddingNewCollection?: boolean;
};

const SaveToCollectionModal = ({
  isOpen,
  collections,
  onCollectionToggled,
  onNewCollectionCreated,
}: SaveToCollectionModalProps) => {
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen}>
      <Modal.Body>
        <div className={styles.header}>{t('quran-reader:save-to')}</div>
        <div className={styles.collectionList}>
          {collections.map((collection) => (
            <div className={styles.collectionItem} key={collection.id}>
              <Checkbox
                id={collection.name}
                checked={collection.checked}
                label={collection.name}
                onChange={() => onCollectionToggled(collection)}
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
                  onNewCollectionCreated(data.name);
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
