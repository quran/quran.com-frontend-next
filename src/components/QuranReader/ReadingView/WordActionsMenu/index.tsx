import React from 'react';

import QuranReflectButton from '../../TranslationView/QuranReflectButton';
import ShareVerseButton from '../../TranslationView/ShareVerseButton';

import styles from './WordActionsMenu.module.scss';

import useSetPortalledZIndex from 'src/components/QuranReader/hooks/useSetPortalledZIndex';
import TranslationsButton from 'src/components/QuranReader/ReadingView/TranslationsButton';
import OverflowVerseActionsMenu from 'src/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from 'src/components/Verse/PlayVerseAudioButton';
import Word from 'types/Word';

type Props = {
  word: Word;
  onActionTriggered?: () => void;
};

const DATA_POPOVER_PORTALLED = 'data-popover-menu-portalled';

const ReadingViewWordActionsMenu: React.FC<Props> = ({ word, onActionTriggered }) => {
  useSetPortalledZIndex(DATA_POPOVER_PORTALLED);
  return (
    <div
      className={styles.container}
      {...{
        [DATA_POPOVER_PORTALLED]: true,
      }}
    >
      <TranslationsButton verse={word.verse} onActionTriggered={onActionTriggered} />
      <ShareVerseButton
        verseKey={word.verseKey}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
      <QuranReflectButton
        verseKey={word.verseKey}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
      {word?.verse?.timestamps && (
        <PlayVerseAudioButton
          verseKey={word.verseKey}
          timestamp={word.verse.timestamps.timestampFrom}
          isTranslationView={false}
          onActionTriggered={onActionTriggered}
        />
      )}
      <div className={styles.readingViewOverflowVerseActionsMenu}>
        <OverflowVerseActionsMenu
          isTranslationView={false}
          verse={word.verse}
          word={word}
          isModal
          isPortalled
          onActionTriggered={onActionTriggered}
        />
      </div>
    </div>
  );
};

export default ReadingViewWordActionsMenu;
