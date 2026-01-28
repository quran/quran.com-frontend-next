import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReaderBioModal.module.scss';

import modalStyles from '@/components/Notes/modal/Modal.module.scss';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';
import { QiraatReader } from '@/types/Qiraat';

interface ReaderBioModalProps {
  reader: QiraatReader | null;
  isOpen: boolean;
  onClose: () => void;
  wasOpenedFromStudyMode?: boolean;
  onBack?: () => void;
}

/**
 * Modal popup showing reader biography.
 * @returns {React.ReactNode} The reader bio modal.
 */
const ReaderBioModal: React.FC<ReaderBioModalProps> = ({
  reader,
  isOpen,
  onClose,
  wasOpenedFromStudyMode = false,
  onBack,
}) => {
  const { t } = useTranslation('common');

  if (!reader) {
    return null;
  }

  const handleClose = () => {
    if (wasOpenedFromStudyMode && onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  const header = onBack ? (
    <button
      type="button"
      className={classNames(modalStyles.headerButton, modalStyles.title)}
      onClick={handleClose}
      data-testid="reader-bio-modal-title"
    >
      <IconContainer
        icon={<ArrowIcon />}
        shouldForceSetColors={false}
        size={IconSize.Custom}
        className={modalStyles.arrowIcon}
      />

      {reader.translatedName ?? reader.abbreviation}
    </button>
  ) : (
    <h2 className={modalStyles.title} data-testid="reader-bio-modal-title">
      {reader.translatedName ?? reader.abbreviation}
    </h2>
  );

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={handleClose}
      size={ContentModalSize.SMALL}
      hasCloseButton
      header={header}
      overlayClassName={modalStyles.overlay}
      headerClassName={modalStyles.headerClassName}
      closeIconClassName={modalStyles.closeIconContainer}
      contentClassName={modalStyles.content}
      innerContentClassName={styles.container}
    >
      {reader.city && <div className={styles.city}>{reader.city}</div>}

      <div className={styles.content}>
        <h3 className={styles.bioTitle}>{t('quran-reader:qiraat.reader-bio')}</h3>
        {reader.bio ? (
          <p className={styles.bioText}>{reader.bio}</p>
        ) : (
          <p className={styles.noBio}>{t('unavailable')}</p>
        )}
      </div>
    </ContentModal>
  );
};

export default ReaderBioModal;
