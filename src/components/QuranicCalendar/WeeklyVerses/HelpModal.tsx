import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './WeeklyVerses.module.scss';

import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Link from '@/dls/Link/Link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('quranic-calendar');
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
      header={t('weekly-verses-help-title')}
    >
      {isOpen && (
        <div className={styles.modalContent}>
          <p>{t('weekly-verses-help-description-1')}</p>
          <p>{t('weekly-verses-help-description-2')}</p>
          <p className={styles.learnMoreLink}>
            <strong>{t('learn-more')}: </strong>
            <Link href="https://quran.com/about" isNewTab>
              {t('about-quran-com')}
            </Link>
          </p>
        </div>
      )}
    </ContentModal>
  );
};

export default HelpModal;
