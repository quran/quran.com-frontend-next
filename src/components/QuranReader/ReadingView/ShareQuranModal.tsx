/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

// Import styles from the original component
import styles from '@/components/HomePage/ReadingSection/NewCard/ShareQuranModal.module.scss';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import ShareButtons from '@/dls/ShareButtons';
import CloseIcon from '@/icons/close.svg';
import { getFirstTimeReadingGuideNavigationUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  verse?: {
    verseKey: string;
  };
}

const ShareQuranModal: React.FC<Props> = ({ isOpen, onClose, verse }) => {
  const { t } = useTranslation('common');
  const shareURL = verse
    ? (() => {
        const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verse.verseKey);
        return `${getBasePath()}/${chapterId}/${verseNumber}`;
      })()
    : `${getBasePath()}${getFirstTimeReadingGuideNavigationUrl()}`;

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} size={ModalSize.MEDIUM}>
      <Modal.Body>
        <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
          <CloseIcon />
        </button>
        <Modal.Title>
          <p className={styles.title}>{t('share-quran-title')}</p>
        </Modal.Title>

        <div className={styles.description}>
          <p className={styles.subtitle}>{t('share-quran-description-line-1')}</p>
          <p className={classNames(styles.subtitle, styles.bold)}>
            {t('share-quran-description-line-2')}
          </p>
          <p className={classNames(styles.subtitle, styles.gray)}>
            {t('share-quran-description-line-3')}
          </p>
        </div>

        <ShareButtons
          url={shareURL}
          title=""
          analyticsContext="share_quran_reader"
          verse={
            verse
              ? (() => {
                  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verse.verseKey);
                  return {
                    chapterId,
                    verseNumber: Number(verseNumber),
                  };
                })()
              : undefined
          }
        />
      </Modal.Body>
    </Modal>
  );
};

export default ShareQuranModal;
