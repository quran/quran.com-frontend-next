import { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import internalStyles from './Notes.module.scss';

import NoteModal from '@/components/Notes/NoteModal';
import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Wrapper from '@/components/Wrapper/Wrapper';
import Badge from '@/dls/Badge/Badge';
import NewLabel from '@/dls/Badge/NewLabel';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import EmptyNotesIcon from '@/icons/notes-empty.svg';
import NotesIcon from '@/icons/notes-filled.svg';
import ConsentType from '@/types/auth/ConsentType';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
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

  const { data: userData } = useSWRImmutable(
    isLoggedIn() ? makeUserProfileUrl() : null,
    getUserProfile,
  );

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

  // TODO: consents is used as a temporary solution until we have a proper way to check if the user has notes
  const shouldShowNewLabel = !userData?.consents?.[ConsentType.HAS_NOTES];

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
        <span className={styles.icon}>
          {hasNotes ? (
            <NotesIcon />
          ) : (
            <Wrapper
              shouldWrap={shouldShowNewLabel}
              wrapper={(children) => (
                <Badge
                  className={internalStyles.newLabelContainer}
                  contentClassName={internalStyles.newLabel}
                  content={shouldShowNewLabel && <NewLabel />}
                >
                  {children}
                </Badge>
              )}
            >
              <EmptyNotesIcon />
            </Wrapper>
          )}
        </span>
      </Button>
    </>
  );
};

export default VerseNotes;
