import React, { useState } from 'react';

import MainActionsMenu from './MainActionsMenu';
import MoreActionsMenu from './MoreActionsMenu';
import VerseActionsMenuType from './types';
import styles from './WordActionsMenu.module.scss';

import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';
import Word from 'types/Word';

type Props = {
  word?: Word;
  verse?: Verse;
  onActionTriggered?: () => void;
  openShareModal?: () => void;
  bookmarksRangeUrl?: string | null;
};

/**
 * Actions menu for reading view - works with either Word or Verse.
 * Accepts either a Word (extracts verse from it) or a Verse directly.
 *
 * @returns {React.ReactElement | null} The actions menu component or null if no verse
 */
const ReadingViewWordActionsMenu: React.FC<Props> = ({
  word,
  verse: verseProp,
  onActionTriggered,
  openShareModal,
  bookmarksRangeUrl,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<VerseActionsMenuType>(VerseActionsMenuType.Main);

  // Use verse prop directly if provided, otherwise extract from word
  const verse = verseProp || word?.verse;

  const onMenuChange = (menu: VerseActionsMenuType) => {
    logEvent(`reading_view_verse_actions_menu_${menu}`);
    setSelectedMenu(menu);
  };

  if (!verse) return null;

  // Render the appropriate menu based on the selected state
  const renderMenu = () => {
    switch (selectedMenu) {
      case VerseActionsMenuType.Main:
        return (
          <MainActionsMenu
            verse={verse}
            onActionTriggered={onActionTriggered}
            openShareModal={openShareModal}
            onMenuChange={onMenuChange}
            bookmarksRangeUrl={bookmarksRangeUrl}
          />
        );
      case VerseActionsMenuType.More:
        return (
          <MoreActionsMenu
            verse={verse}
            onActionTriggered={onActionTriggered}
            onMenuChange={onMenuChange}
          />
        );
      default:
        return null;
    }
  };

  return <div className={styles.container}>{renderMenu()}</div>;
};

export default ReadingViewWordActionsMenu;
