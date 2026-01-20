import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './MyNotes.module.scss';

import { LOADING_POST_ID } from '@/components/Notes/modal/constant';
import { NoteWithRecentReflection } from '@/components/Notes/modal/type';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import QRColoredIcon from '@/icons/qr-colored.svg';
import { Note } from '@/types/auth/Note';
import { logButtonClick } from '@/utils/eventLogger';

interface QRButtonProps {
  note: NoteWithRecentReflection;
  postUrl?: string;
  onPostToQrClick: (note: Note) => void;
}

const QRButton: React.FC<QRButtonProps> = ({ note, postUrl, onPostToQrClick }) => {
  const { t } = useTranslation('notes');

  const handlePostToQrClick = useCallback(() => {
    onPostToQrClick(note);
    logButtonClick('my_notes_post_to_qr');
  }, [note, onPostToQrClick]);

  const isLoading = note.recentReflection?.id === LOADING_POST_ID;

  return postUrl ? (
    <Button
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      shape={ButtonShape.Square}
      isNewTab
      href={postUrl}
      isDisabled={isLoading}
      tooltip={t('view-on-qr')}
      ariaLabel={t('view-on-qr')}
      onClick={() => logButtonClick('my_notes_view_on_qr')}
      data-testid="qr-view-button"
    >
      <IconContainer
        size={IconSize.Xsmall}
        shouldForceSetColors={false}
        icon={
          isLoading ? (
            <Spinner shouldDelayVisibility={false} size={SpinnerSize.Small} />
          ) : (
            <QRColoredIcon />
          )
        }
      />
    </Button>
  ) : (
    <button
      type="button"
      data-testid="post-to-qr-button"
      onClick={handlePostToQrClick}
      className={styles.postToButton}
      aria-label={t('post-to')}
    >
      {t('post-to')} <QRColoredIcon />
    </button>
  );
};

export default QRButton;
