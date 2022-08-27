/* eslint-disable i18next/no-literal-string */

import styles from './RenameCollectionModal.module.scss';

import Modal from 'src/components/dls/Modal/Modal';
import FormBuilder from 'src/components/FormBuilder/FormBuilder';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

export type Collection = {
  name: string;
  checked?: boolean;
};

type RenameCollectionModalProps = {
  isOpen: boolean;
  onSubmit: (data: any) => void;
};

const RenameCollectionModal = ({ isOpen, onSubmit }: RenameCollectionModalProps) => {
  return (
    <Modal isOpen={isOpen}>
      <Modal.Body>
        <div className={styles.header}>Rename Collection</div>
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
            onSubmit={onSubmit}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RenameCollectionModal;
