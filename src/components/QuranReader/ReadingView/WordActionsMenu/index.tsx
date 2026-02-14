import React, { useState } from 'react';

import MainActionsMenu from './MainActionsMenu';
import MoreActionsMenu from './MoreActionsMenu';
import VerseActionsMenuType from './types';
import styles from './WordActionsMenu.module.scss';

import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

type Props = {
  verse?: Verse;
  onActionTriggered?: () => void;
  openShareModal?: () => void;
};

/**
 * Actions menu for reading view.
 * Accepts a Verse directly for actions like tafsir, reflections, bookmarks, etc.
 *
 * @returns {React.ReactElement | null} The actions menu component or null if no verse
 */
const ReadingViewWordActionsMenu: React.FC<Props> = ({
  verse,
  onActionTriggered,
  openShareModal,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<VerseActionsMenuType>(VerseActionsMenuType.Main);

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
