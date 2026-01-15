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
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
  onMenuChange: (menu: VerseActionsMenuType) => void;
  openShareModal?: () => void;
  bookmarksRangeUrl?: string | null;
}

const MainActionsMenu: React.FC<Props> = ({
  verse,
  onActionTriggered,
  onMenuChange,
  openShareModal,
  bookmarksRangeUrl,
}) => {
  return (
    <>
      {verse?.timestamps && (
        <PlayAudioMenuItem
          verse={{
            verseKey: verse.verseKey,
            timestamps: verse.timestamps,
            chapterId: verse.chapterId,
            verseNumber: verse.verseNumber,
          }}
          onActionTriggered={onActionTriggered}
        />
      )}

      <TranslationsMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <TafsirMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <QuranReflectMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <QuestionsMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <BookmarkAction
        verse={verse}
        isTranslationView={false}
        onActionTriggered={onActionTriggered}
        bookmarksRangeUrl={bookmarksRangeUrl}
      />
      <CopyMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <NotesAction verse={verse} onActionTriggered={onActionTriggered} />

      {/* Submenu navigation items */}
      <ShareMenuItem onActionTriggered={onActionTriggered} openShareModal={openShareModal} />
      <MoreMenuItem onMenuChange={onMenuChange} />
    </>
  );
};

export default MainActionsMenu;
