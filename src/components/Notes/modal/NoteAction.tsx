import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './NoteAction.module.scss';

import MyNotesModal from '@/components/Notes/modal/MyNotesModal';
import NoteModal from '@/components/Notes/modal/NoteModal';
import translationViewStyles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import NotesWithPencilFilledIcon from '@/icons/notes-with-pencil-filled.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';
import { WordVerse } from '@/types/Word';
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

interface NoteActionProps {
  verse: WordVerse;
  isTranslationView: boolean;
  hasNotes: boolean;
  onActionTriggered?: () => void;
}

const CLOSE_POPOVER_AFTER_MS = 150;

const NoteAction: React.FC<NoteActionProps> = ({
  verse,
  isTranslationView,
  hasNotes,
  onActionTriggered,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { data: notesCount } = useCountRangeNotes({ from: verse.verseKey, to: verse.verseKey });

  const getEventName = useCallback(
    (action: string) =>
      `${isTranslationView ? 'translation_view' : 'reading_view'}_add_note_modal_${action}`,
    [isTranslationView],
  );

  const onModalClose = useCallback(() => {
    logEvent(getEventName('close'));

    setIsModalOpen(false);

    if (onActionTriggered) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      closeTimeoutRef.current = setTimeout(() => {
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  }, [getEventName, onActionTriggered]);

  const onModalOpen = useCallback(() => {
    logEvent(getEventName('open'));
    setIsModalOpen(true);
  }, [getEventName]);

  /**
   * Handles click events for guest users, redirecting to login if not authenticated,
   * otherwise opens the translation feedback modal.
   */
  const handleGuestUserClick = useCallback(() => {
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
      return;
    }

    onModalOpen();
  }, [router, verse.verseKey, onModalOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const [isNotesOnVerseModalOpen, setIsNotesOnVerseModalOpen] = useState(false);

  const onNotesOnVerseModalClose = useCallback(() => {
    setIsNotesOnVerseModalOpen(false);
  }, []);

  const onNotesOnVerseModalOpen = useCallback(() => {
    setIsNotesOnVerseModalOpen(true);
    onModalClose();
  }, [onModalClose]);

  return (
    <>
      <Button
        className={classNames(
          translationViewStyles.iconContainer,
          translationViewStyles.verseAction,
        )}
        onClick={handleGuestUserClick}
        tooltip={t('notes:take-a-note-or-reflection')}
        type={ButtonType.Primary}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        ariaLabel={t('notes:take-a-note-or-reflection')}
      >
        <span className={translationViewStyles.icon}>
          <IconContainer
            icon={hasNotes ? <NotesWithPencilFilledIcon /> : <NotesWithPencilIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
          />
        </span>
      </Button>

      <ContentModal
        isOpen={isModalOpen}
        header={<p className={styles.title}>{t('notes:take-a-note-or-reflection')}</p>}
        hasCloseButton
        onClose={onModalClose}
        onEscapeKeyDown={onModalClose}
        contentClassName={modalStyles.content}
        overlayClassName={modalStyles.overlay}
      >
        <NoteModal
          notesCount={notesCount?.[verse.verseKey] ?? 0}
          onNotesOnVerseModalOpen={onNotesOnVerseModalOpen}
        />
      </ContentModal>

      <MyNotesModal
        isOpen={isNotesOnVerseModalOpen}
        onClose={onNotesOnVerseModalClose}
        notesCount={notesCount?.[verse.verseKey] ?? 0}
      />
    </>
  );
};

export default NoteAction;
