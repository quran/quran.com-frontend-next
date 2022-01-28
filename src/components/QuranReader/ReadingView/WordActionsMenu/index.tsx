import React from 'react';

import QuranReflectButton from '../../TranslationView/QuranReflectButton';
import ShareVerseButton from '../../TranslationView/ShareVerseButton';

import styles from './WordActionsMenu.module.scss';

import OverflowVerseActionsMenu from 'src/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from 'src/components/Verse/PlayVerseAudioButton';
import Word from 'types/Word';

type Props = {
  word: Word;
  onActionTriggered?: () => void;
};

const ReadingViewWordActionsMenu: React.FC<Props> = ({ word, onActionTriggered }) => {
  return (
    <div className={styles.container}>
      <div className={styles.readingViewOverflowVerseActionsMenu}>
        <OverflowVerseActionsMenu
          isTranslationView={false}
          verse={word.verse}
          isModal
          isPortalled
          onActionTriggered={onActionTriggered}
        />
      </div>
      {word?.verse?.timestamps && (
        <PlayVerseAudioButton
          verseKey={word.verseKey}
          timestamp={word.verse.timestamps.timestampFrom}
          isTranslationView={false}
          onActionTriggered={onActionTriggered}
        />
      )}
      <QuranReflectButton
        verseKey={word.verseKey}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
      <ShareVerseButton
        verseKey={word.verseKey}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
    </div>
  );
};

export default ReadingViewWordActionsMenu;
