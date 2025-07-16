import { useContext, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import NotesFilledIcon from '@/icons/notes-with-pencil-filled.svg';
import NotesIcon from '@/icons/notes-with-pencil.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';
import AudioPlayerEventType from '@/xstate/actors/audioPlayer/types/AudioPlayerEventType';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

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
  const audioPlayerService = useContext(AudioPlayerMachineContext);

  const onItemClicked = () => {
    const isUserLoggedIn = isLoggedIn();
    logButtonClick('verse_actions_menu_note', {
      isTranslationView,
      isLoggedIn,
    });

    if (!isUserLoggedIn) {
      audioPlayerService.send({ type: 'CLOSE' } as AudioPlayerEventType);

      try {
        router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verseKey)));
      } catch {
        // If there's an error parsing the verseKey, navigate to chapter 1
        router.push(getLoginNavigationUrl('/1'));
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const onModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        className={classNames(styles.iconContainer, styles.verseAction)}
        onClick={onItemClicked}
        tooltip={t('notes.label')}
        type={ButtonType.Primary}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        ariaLabel={t('notes.label')}
      >
        <span className={styles.icon}>
          {hasNotes ? (
            <NotesFilledIcon />
          ) : (
            <IconContainer icon={<NotesIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
          )}
        </span>
      </Button>

      <NoteModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        verseKey={verseKey}
        isOverlayMax
        isBottomSheetOnMobile
      />
    </>
  );
};

export default VerseNotes;
