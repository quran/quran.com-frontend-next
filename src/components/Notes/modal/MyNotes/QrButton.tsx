import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './MyNotes.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import QRColoredIcon from '@/icons/qr-colored.svg';
import { Note } from '@/types/auth/Note';
import { logButtonClick } from '@/utils/eventLogger';

interface QRButtonProps {
  note: Note;
  postUrl: string;
  onPostToQrClick: (note: Note) => void;
}

const QRButton: React.FC<QRButtonProps> = ({ note, postUrl, onPostToQrClick }) => {
  const { t } = useTranslation('notes');

  const handlePostToQrClick = useCallback(() => {
    onPostToQrClick(note);
    logButtonClick('my_notes_post_to_qr');
  }, [note, onPostToQrClick]);

  return postUrl ? (
    <Button
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      shape={ButtonShape.Square}
      isNewTab
      href={postUrl}
      tooltip={t('view-on-qr')}
      ariaLabel={t('view-on-qr')}
      onClick={() => logButtonClick('my_notes_view_on_qr')}
      data-testid="qr-view-button"
    >
      <QRColoredIcon />
    </Button>
  ) : (
    <button
      type="button"
      data-testid="post-to-qr-button"
      onClick={handlePostToQrClick}
      className={styles.postToButton}
    >
      {t('post-to')} <QRColoredIcon />
    </button>
  );
};

export default QRButton;
