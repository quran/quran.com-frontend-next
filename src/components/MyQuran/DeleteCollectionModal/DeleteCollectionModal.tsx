import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './DeleteCollectionModal.module.scss';

import DeleteConfirmationModal from '@/dls/DeleteConfirmationModal';

interface DeleteCollectionModalProps {
  isOpen: boolean;
  collectionName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteCollectionModal: React.FC<DeleteCollectionModalProps> = ({
  isOpen,
  collectionName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation('collection');

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      title={t('delete-collection.title')}
      subtitle={
        <Trans
          i18nKey="delete-collection.subtitle-tagged"
          ns="collection"
          components={{ collectionName: <span className={styles.collectionName} /> }}
          values={{ collectionName }}
        />
      }
      description={t('delete-collection.description')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};

export default DeleteCollectionModal;
