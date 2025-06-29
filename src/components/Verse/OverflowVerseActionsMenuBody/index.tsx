import React, { useState } from 'react';

import SaveToCollectionAction from '../SaveToCollectionAction';
import VerseActionAdvancedCopy from '../VerseActionAdvancedCopy';
import VerseActionRepeatAudio from '../VerseActionRepeatAudio';

import ShareVerseActionsMenu from './ShareVerseActionsMenu';

import VerseActionsMenuType from '@/components/QuranReader/ReadingView/WordActionsMenu/types';
import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import { isLoggedIn } from '@/utils/auth/login';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl: string;
}

const OverflowVerseActionsMenuBody: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<VerseActionsMenuType>(VerseActionsMenuType.Main);

  return selectedMenu === VerseActionsMenuType.Main ? (
    <div>
      {isLoggedIn() && (
        <SaveToCollectionAction
          verse={verse}
          bookmarksRangeUrl={bookmarksRangeUrl}
          isTranslationView={isTranslationView}
        />
      )}
      <VerseActionAdvancedCopy
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={isTranslationView}
      />
      <WordByWordVerseAction verse={verse} onActionTriggered={onActionTriggered} />
      <VerseActionRepeatAudio isTranslationView={isTranslationView} verseKey={verse.verseKey} />
    </div>
  ) : (
    <ShareVerseActionsMenu
      onActionTriggered={onActionTriggered}
      verse={verse}
      isTranslationView={isTranslationView}
      setSelectedMenu={setSelectedMenu}
    />
  );
};

export default OverflowVerseActionsMenuBody;
