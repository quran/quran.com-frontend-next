/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import PlusIcon from '../../../../public/icons/plus.svg';

import styles from './SaveToCollectionModal.module.scss';

import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
import Modal from 'src/components/dls/Modal/Modal';
import FormBuilder from 'src/components/FormBuilder/FormBuilder';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

export type Collection = {
  name: string;
  checked?: boolean;
};

type SaveToCollectionModalProps = {
  isOpen: boolean;
  collections: Collection[];
  onCollectionToggled: (collection: Collection) => void;
  onNewCollectionCreated: (name: string) => void;
};

const SaveToCollectionModal = ({
  isOpen,
  collections,
  onCollectionToggled,
  onNewCollectionCreated,
}: SaveToCollectionModalProps) => {
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);

  return (
    <Modal isOpen={isOpen}>
      <Modal.Body>
        <div className={styles.header}>Save to...</div>
        <div className={styles.collectionList}>
          {collections.map((collection) => (
            <div className={styles.collectionItem} key={collection.name}>
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
              Add Collection
            </Button>
          )}

          {isAddingNewCollection && (
            <div className={styles.newCollectionFormContainer}>
              <FormBuilder
                formFields={[
                  {
                    field: 'name',
                    label: 'New collection name',
                    rules: [{ type: RuleType.Required, value: true, errorMessage: 'Required' }],
                    type: FormFieldType.Text,
                  },
                ]}
                actionText="Submit"
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
