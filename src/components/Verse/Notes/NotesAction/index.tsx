import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import EmptyNotesIcon from '@/icons/notes-empty.svg';
import NotesIcon from '@/icons/notes-filled.svg';
import Verse from '@/types/Verse';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  verse: Verse;
};

const NotesAction: React.FC<Props> = ({ verse }) => {
  const { data: notesCount } = useCountRangeNotes({ from: verse.verseKey, to: verse.verseKey });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');

  const router = useRouter();

  const onNotesClicked = () => {
    const isUserLoggedIn = isLoggedIn();
    logButtonClick('note_menu_item', { isUserLoggedIn });
    if (!isUserLoggedIn) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
    } else {
      setIsModalOpen(true);
    }
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  const hasNotes = notesCount && notesCount[verse.verseKey] > 0;

  return (
    <>
      <PopoverMenu.Item
        onClick={onNotesClicked}
        icon={hasNotes ? <NotesIcon /> : <EmptyNotesIcon />}
      >
        {t('notes.title')}
      </PopoverMenu.Item>
      <NoteModal isOpen={isModalOpen} onClose={onClose} verseKey={verse.verseKey} />
    </>
  );
};

export default NotesAction;
