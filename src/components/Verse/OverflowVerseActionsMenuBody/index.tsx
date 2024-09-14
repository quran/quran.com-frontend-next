import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import BookmarkAction from '../BookmarkAction';
import NotesAction from '../Notes/NotesAction';
import SaveToCollectionAction from '../SaveToCollectionAction';
import VerseActionRepeatAudio from '../VerseActionRepeatAudio';

import styles from './OverflowVerseActionsMenuBody.module.scss';
import ShareVerseActionsMenu, { VerseActionsOverflowMenu } from './ShareVerseActionsMenu';

import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import NewLabel from '@/dls/Badge/NewLabel';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import ShareIcon from '@/icons/share.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl: string;
}

const OverflowVerseActionsMenuBody: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const { t } = useTranslation('common');
  const [selectedMenu, setSelectedMenu] = useState<VerseActionsOverflowMenu>(
    VerseActionsOverflowMenu.Main,
  );
  const onShareItemClicked = () => {
    logButtonClick(`share_verse_action`);
    setSelectedMenu(VerseActionsOverflowMenu.Share);
  };

  return selectedMenu === VerseActionsOverflowMenu.Main ? (
    <div>
      {!isTranslationView && <NotesAction verse={verse} />}
      {!isTranslationView && (
        <WordByWordVerseAction verse={verse} onActionTriggered={onActionTriggered} />
      )}
      <BookmarkAction
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
        bookmarksRangeUrl={bookmarksRangeUrl}
      />
      {isLoggedIn() && (
        <SaveToCollectionAction
          verse={verse}
          bookmarksRangeUrl={bookmarksRangeUrl}
          isTranslationView={isTranslationView}
        />
      )}
      <PopoverMenu.Item icon={<ShareIcon />} onClick={onShareItemClicked}>
        <div className={styles.menuWithNestedItems}>
          {t('share')}
          <div className={styles.newLabelContainer}>
            <NewLabel />
            <IconContainer
              shouldForceSetColors={false}
              icon={<ChevronRightIcon />}
              shouldFlipOnRTL
              size={IconSize.Small}
            />
          </div>
        </div>
      </PopoverMenu.Item>
      <VerseActionRepeatAudio isTranslationView={isTranslationView} verseKey={verse.verseKey} />
    </div>
  ) : (
    <ShareVerseActionsMenu
      onActionTriggered={onActionTriggered}
      verse={verse}
      isTranslationView={isTranslationView}
      setSelectedMenu={setSelectedMenu}
    />
  );
};

export default OverflowVerseActionsMenuBody;
