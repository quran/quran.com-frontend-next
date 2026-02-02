import React from 'react';

import CopyMenuItem from './MenuItems/CopyMenuItem';
import MoreMenuItem from './MenuItems/MoreMenuItem';
import PinMenuItem from './MenuItems/PinMenuItem';
import PlayAudioMenuItem from './MenuItems/PlayAudioMenuItem';
import QuestionsMenuItem from './MenuItems/QuestionsMenuItem';
import QuranReflectMenuItem from './MenuItems/QuranReflectMenuItem';
import ShareMenuItem from './MenuItems/ShareMenuItem';
import TafsirMenuItem from './MenuItems/TafsirMenuItem';
import TranslationsMenuItem from './MenuItems/TranslationsMenuItem';
import VerseActionsMenuType from './types';

import ReadingViewNoteAction from '@/components/Notes/modal/ReadingViewNoteAction';
import BookmarkAction from '@/components/Verse/BookmarkAction';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
  onMenuChange: (menu: VerseActionsMenuType) => void;
  openShareModal?: () => void;
}

const MainActionsMenu: React.FC<Props> = ({
  verse,
  onActionTriggered,
  onMenuChange,
  openShareModal,
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
      />
      <CopyMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <PinMenuItem verse={verse} onActionTriggered={onActionTriggered} />

      <ReadingViewNoteAction verseKey={verse.verseKey} onActionTriggered={onActionTriggered} />

      {/* Submenu navigation items */}
      <ShareMenuItem onActionTriggered={onActionTriggered} openShareModal={openShareModal} />
      <MoreMenuItem onMenuChange={onMenuChange} />
    </>
  );
};

export default MainActionsMenu;
