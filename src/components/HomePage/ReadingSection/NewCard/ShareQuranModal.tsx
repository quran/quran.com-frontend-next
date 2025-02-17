/* eslint-disable i18next/no-literal-string */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ShareQuranModal.module.scss';

import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import ShareButtons from '@/dls/ShareButtons';
import CloseIcon from '@/icons/close.svg';
import { getFirstTimeReadingGuideNavigationUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ShareQuranModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('home');
  const shareURL = `${getBasePath()}${getFirstTimeReadingGuideNavigationUrl()}`;

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} size={ModalSize.MEDIUM}>
      <Modal.Body>
        <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
          <CloseIcon />
        </button>
        <Modal.Title>
          <p className={styles.title}>{t('share-quran.title')}</p>
        </Modal.Title>
        <div className={styles.subtitle}>{t('share-quran.description')}</div>
        <ShareButtons
          url={shareURL}
          title={t('share-quran.title')}
          analyticsContext="share_quran"
        />
      </Modal.Body>
    </Modal>
  );
};

export default ShareQuranModal;
