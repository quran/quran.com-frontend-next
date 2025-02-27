/* eslint-disable i18next/no-literal-string */
import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AddReflectionModal.module.scss';

import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Link from '@/dls/Link/Link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddReflectionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('learn');
  const contentModalRef = useRef<ContentModalHandles>();

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
      contentClassName={styles.contentModal}
      closeIconClassName={styles.closeIcon}
      headerClassName={styles.header}
      header={t('what-happens-when-you-click-add-reflection')}
    >
      {isOpen && (
        <div className={styles.modalContent}>
          <p>{t('reflection-description-1')}</p>
          <p>{t('reflection-description-2')}</p>
          <p className={styles.learnMoreLink}>
            <strong>{t('learn-more')}: </strong>
            <Link href="https://quranreflect.com/faq" isNewTab>
              QuranReflect.com/faq
            </Link>
          </p>
        </div>
      )}
    </ContentModal>
  );
};

export default AddReflectionModal;
