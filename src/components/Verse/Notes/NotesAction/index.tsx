import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import useSafeTimeout from '@/hooks/useSafeTimeout';
import EmptyNotesIcon from '@/icons/notes-empty.svg';
import NotesIcon from '@/icons/notes-filled.svg';
import Verse from '@/types/Verse';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  verse: Verse;
  onActionTriggered?: () => void;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const NotesAction: React.FC<Props> = ({ verse, onActionTriggered }) => {
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

  // Use the safe timeout hook
  const setSafeTimeout = useSafeTimeout();

  const onModalClose = () => {
    logEvent('reading_view_notes_modal_close');
    setIsModalOpen(false);

    if (onActionTriggered) {
      // Use the safe timeout hook to handle cleanup automatically
      setSafeTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
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
      <NoteModal isOpen={isModalOpen} onClose={onModalClose} verseKey={verse.verseKey} />
    </>
  );
};

export default NotesAction;
