import React, { useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import useSafeTimeout from '@/hooks/useSafeTimeout';
import NotesIcon from '@/icons/notes-filled.svg';
import NotesFilledIcon from '@/icons/notes-with-pencil-filled.svg';
import { WordVerse } from '@/types/Word';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';
import AudioPlayerEventType from '@/xstate/actors/audioPlayer/types/AudioPlayerEventType';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

type Props = {
  verse: WordVerse;
  onActionTriggered?: () => void;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const NotesAction: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { data: notesCount } = useCountRangeNotes({ from: verse.verseKey, to: verse.verseKey });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');

  const router = useRouter();
  const audioPlayerService = useContext(AudioPlayerMachineContext);

  const onNotesClicked = () => {
    const isUserLoggedIn = isLoggedIn();
    logButtonClick('note_menu_item', { isUserLoggedIn });
    if (!isUserLoggedIn) {
      audioPlayerService.send({ type: 'CLOSE' } as AudioPlayerEventType);

      try {
        router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
      } catch {
        // If there's an error parsing the verseKey, navigate to chapter 1
        router.push(getLoginNavigationUrl('/1'));
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const setSafeTimeout = useSafeTimeout();

  const onModalClose = () => {
    logEvent('reading_view_notes_modal_close');
    setIsModalOpen(false);

    if (onActionTriggered) {
      setSafeTimeout(() => {
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };
  const hasNotes = notesCount && notesCount[verse.verseKey] > 0;

  return (
    <>
      <PopoverMenu.Item
        onClick={onNotesClicked}
        icon={
          hasNotes ? (
            <NotesFilledIcon />
          ) : (
            <IconContainer
              icon={<NotesIcon />}
              color={IconColor.tertiary}
              size={IconSize.Custom}
              shouldFlipOnRTL={false}
            />
          )
        }
      >
        {t('notes.label')}
      </PopoverMenu.Item>
      <NoteModal isOpen={isModalOpen} onClose={onModalClose} verseKey={verse.verseKey} />
    </>
  );
};

export default NotesAction;
