import React from 'react';

import CopyMenuItem from './MenuItems/CopyMenuItem';
import MoreMenuItem from './MenuItems/MoreMenuItem';
import PlayAudioMenuItem from './MenuItems/PlayAudioMenuItem';
import QuestionsMenuItem from './MenuItems/QuestionsMenuItem';
import QuranReflectMenuItem from './MenuItems/QuranReflectMenuItem';
import ShareMenuItem from './MenuItems/ShareMenuItem';
import TafsirMenuItem from './MenuItems/TafsirMenuItem';
import TranslationsMenuItem from './MenuItems/TranslationsMenuItem';
import VerseActionsMenuType from './types';

import BookmarkAction from '@/components/Verse/BookmarkAction';
import NotesAction from '@/components/Verse/Notes/NotesAction';
import Word from 'types/Word';

interface Props {
  word: Word;
  onActionTriggered?: () => void;
  onMenuChange: (menu: VerseActionsMenuType) => void;
  openShareModal?: () => void;
}

const MainActionsMenu: React.FC<Props> = ({
  word,
  onActionTriggered,
  onMenuChange,
  openShareModal,
}) => {
  return (
    <>
      {word?.verse?.timestamps && (
        <PlayAudioMenuItem
          verse={{
            verseKey: word.verseKey,
            timestamps: word.verse.timestamps,
            chapterId: word.verse.chapterId,
            verseNumber: word.verse.verseNumber,
          }}
          onActionTriggered={onActionTriggered}
        />
      )}

      <TranslationsMenuItem verse={word.verse} onActionTriggered={onActionTriggered} />
      <TafsirMenuItem verse={word.verse} onActionTriggered={onActionTriggered} />
      <QuranReflectMenuItem verse={word.verse} onActionTriggered={onActionTriggered} />
      <QuestionsMenuItem verse={word.verse} onActionTriggered={onActionTriggered} />
      <BookmarkAction
        verse={word.verse}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
      />
      <CopyMenuItem verse={word.verse} onActionTriggered={onActionTriggered} />
      <NotesAction verse={word.verse} onActionTriggered={onActionTriggered} />

      {/* Submenu navigation items */}
      <ShareMenuItem onActionTriggered={onActionTriggered} openShareModal={openShareModal} />
      <MoreMenuItem onMenuChange={onMenuChange} />
    </>
  );
};

export default MainActionsMenu;
