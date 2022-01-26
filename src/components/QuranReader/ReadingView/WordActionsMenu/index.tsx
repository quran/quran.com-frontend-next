import React from 'react';

import QuranReflectButton from '../../TranslationView/QuranReflectButton';
import ShareVerseButton from '../../TranslationView/ShareVerseButton';

import styles from './WordActionsMenu.module.scss';

import OverflowVerseActionsMenu from 'src/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from 'src/components/Verse/PlayVerseAudioButton';
import Word from 'types/Word';

type Props = {
  word: Word;
};

const ReadingViewWordActionsMenu: React.FC<Props> = ({ word }) => {
  return (
    <div className={styles.container}>
      <div className={styles.readingViewOverflowVerseActionsMenu}>
        <OverflowVerseActionsMenu verse={word.verse} isModal isPortalled />
      </div>
      {word?.verse?.timestamps && (
        <PlayVerseAudioButton
          verseKey={word.verseKey}
          timestamp={word.verse.timestamps.timestampFrom}
        />
      )}
      <QuranReflectButton verseKey={word.verseKey} />
      <ShareVerseButton verseKey={word.verseKey} />
    </div>
  );
};

export default ReadingViewWordActionsMenu;
