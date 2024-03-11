import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import EmptyNotesIcon from '@/icons/notes-empty.svg';
import NotesIcon from '@/icons/notes-filled.svg';
import Verse from '@/types/Verse';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  verse: Verse;
};

const NotesAction: React.FC<Props> = ({ verse }) => {
  const { data: notesCount } = useCountRangeNotes({ from: verse.verseKey, to: verse.verseKey });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const onCopyClicked = () => {
    logButtonClick('note_menu_item');
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  const hasNotes = notesCount && notesCount[verse.verseKey] > 0;

  return (
    <>
      <PopoverMenu.Item
        onClick={onCopyClicked}
        icon={hasNotes ? <NotesIcon /> : <EmptyNotesIcon />}
      >
        {t('notes.title')}
      </PopoverMenu.Item>
      <NoteModal isOpen={isModalOpen} onClose={onClose} verseKey={verse.verseKey} />
    </>
  );
};

export default NotesAction;
