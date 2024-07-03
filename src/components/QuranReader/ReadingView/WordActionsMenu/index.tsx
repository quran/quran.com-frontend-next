import React from 'react';

import QuranReflectButton from '../../QuranReflectButton';

import styles from './WordActionsMenu.module.scss';

import TranslationsButton from '@/components/QuranReader/ReadingView/TranslationsButton';
import TafsirButton from '@/components/QuranReader/TafsirButton';
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
      <TafsirButton
        verseKey={word.verseKey}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
      <QuranReflectButton
        verseKey={word.verseKey}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
      <TranslationsButton verse={word.verse} onActionTriggered={onActionTriggered} />
      {word?.verse?.timestamps && (
        <PlayVerseAudioButton
          verseKey={word.verseKey}
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
