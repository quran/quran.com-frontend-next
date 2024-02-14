import { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '../../QuranReader/TranslationView/TranslationViewCell.module.scss';

import NoteModal from '@/components/Notes/NoteModal';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import NoteIcon from '@/icons/reader.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

export enum VerseNotesTrigger {
  IconButton = 'button',
  PopoverItem = 'popoverItem',
}

type VerseNotesProps = {
  verseKey: string;
  isTranslationView: boolean;
  trigger?: VerseNotesTrigger;
};

const VerseNotes = ({
  verseKey,
  isTranslationView,
  trigger = VerseNotesTrigger.PopoverItem,
}: VerseNotesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  const onItemClicked = () => {
    const isUserLoggedIn = isLoggedIn();
    logButtonClick('verse_actions_menu_note', {
      isTranslationView,
      trigger,
      isLoggedIn,
    });
    if (!isUserLoggedIn) {
      router.push(getLoginNavigationUrl());
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
      {trigger === VerseNotesTrigger.IconButton ? (
        <Button
          className={classNames(styles.iconContainer, styles.verseAction)}
          onClick={onItemClicked}
          tooltip={t('notes.notes')}
          variant={ButtonVariant.Ghost}
          size={ButtonSize.Small}
        >
          <NoteIcon />
        </Button>
      ) : (
        <PopoverMenu.Item icon={<NoteIcon />} onClick={onItemClicked}>
          {t('notes.notes')}
        </PopoverMenu.Item>
      )}
    </>
  );
};

export default VerseNotes;
