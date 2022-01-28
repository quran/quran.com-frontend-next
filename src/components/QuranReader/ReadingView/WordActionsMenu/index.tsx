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
        <OverflowVerseActionsMenu
          isTranslationView={false}
          verse={word.verse}
          isModal
          isPortalled
        />
      </div>
      {word?.verse?.timestamps && (
        <PlayVerseAudioButton
          verseKey={word.verseKey}
          timestamp={word.verse.timestamps.timestampFrom}
          isTranslationView={false}
        />
      )}
      <QuranReflectButton verseKey={word.verseKey} isTranslationView={false} />
      <ShareVerseButton verseKey={word.verseKey} isTranslationView={false} />
    </div>
  );
};

export default ReadingViewWordActionsMenu;
