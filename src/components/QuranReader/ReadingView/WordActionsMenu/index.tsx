import React from 'react';

import QuranReflectButton from '../../TranslationView/QuranReflectButton';
import ShareVerseButton from '../../TranslationView/ShareVerseButton';

import styles from './WordActionsMenu.module.scss';

import TranslationsButton from '@/components/QuranReader/ReadingView/TranslationsButton';
import OverflowVerseActionsMenu from '@/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from '@/components/Verse/PlayVerseAudioButton';
import Word from 'types/Word';

type Props = {
  word: Word;
  onActionTriggered?: () => void;
};

const ReadingViewWordActionsMenu: React.FC<Props> = ({ word, onActionTriggered }) => {
  return (
    <div className={styles.container}>
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
          onActionTriggered={onActionTriggered}
        />
      </div>
    </div>
  );
};

export default ReadingViewWordActionsMenu;
