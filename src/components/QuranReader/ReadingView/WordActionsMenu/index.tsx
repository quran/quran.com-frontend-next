import React, { useState } from 'react';

import MainActionsMenu from './MainActionsMenu';
import MoreActionsMenu from './MoreActionsMenu';
import VerseActionsMenuType from './types';
import styles from './WordActionsMenu.module.scss';

import { logEvent } from '@/utils/eventLogger';
import Word from 'types/Word';

type Props = {
  word: Word;
  onActionTriggered?: () => void;
  openShareModal?: () => void;
};

const ReadingViewWordActionsMenu: React.FC<Props> = ({
  word,
  onActionTriggered,
  openShareModal,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<VerseActionsMenuType>(VerseActionsMenuType.Main);

  const onMenuChange = (menu: VerseActionsMenuType) => {
    logEvent(`reading_view_verse_actions_menu_${menu}`);
    setSelectedMenu(menu);
  };

  // Render the appropriate menu based on the selected state
  const renderMenu = () => {
    switch (selectedMenu) {
      case VerseActionsMenuType.Main:
        return (
          <MainActionsMenu
            word={word}
            onActionTriggered={onActionTriggered}
            openShareModal={openShareModal}
            onMenuChange={onMenuChange}
          />
        );
      case VerseActionsMenuType.More:
        return (
          <MoreActionsMenu
            verse={word.verse}
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
