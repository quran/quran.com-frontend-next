import { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import EmptyNotesIcon from '@/icons/notes-empty.svg';
import NotesIcon from '@/icons/notes-filled.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

export enum VerseNotesTrigger {
  IconButton = 'button',
  PopoverItem = 'popoverItem',
}

type VerseNotesProps = {
  verseKey: string;
  isTranslationView: boolean;
  hasNotes?: boolean;
};

const VerseNotes = ({ verseKey, isTranslationView, hasNotes }: VerseNotesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  const onItemClicked = () => {
    const isUserLoggedIn = isLoggedIn();
    logButtonClick('verse_actions_menu_note', {
      isTranslationView,
      isLoggedIn,
    });
    if (!isUserLoggedIn) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verseKey)));
    } else {
      setIsModalOpen(true);
    }
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <NoteModal isOpen={isModalOpen} onClose={onClose} verseKey={verseKey} />
      <Button
        className={classNames(styles.iconContainer, styles.verseAction, styles.fadedVerseAction)}
        onClick={onItemClicked}
        tooltip={t('notes.title')}
        type={ButtonType.Primary}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
      >
        <span className={styles.icon}>{hasNotes ? <NotesIcon /> : <EmptyNotesIcon />}</span>
      </Button>
    </>
  );
};

export default VerseNotes;
