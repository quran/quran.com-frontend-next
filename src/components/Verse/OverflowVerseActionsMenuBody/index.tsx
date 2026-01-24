import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import SaveToCollectionAction from '../SaveToCollectionAction';
import TranslationFeedbackAction from '../TranslationFeedback/TranslationFeedbackAction';
import VerseActionAdvancedCopy from '../VerseActionAdvancedCopy';
import VerseActionEmbedWidget from '../VerseActionEmbedWidget';
import VerseActionRepeatAudio from '../VerseActionRepeatAudio';

import ShareVerseActionsMenu from './ShareVerseActionsMenu';

import VerseActionsMenuType from '@/components/QuranReader/ReadingView/WordActionsMenu/types';
import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import { selectStudyModeIsOpen } from '@/redux/slices/QuranReader/studyMode';
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
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

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
      {!isStudyModeOpen && (
        <WordByWordVerseAction verse={verse} onActionTriggered={onActionTriggered} />
      )}
      {!isStudyModeOpen && (
        <VerseActionRepeatAudio isTranslationView={isTranslationView} verseKey={verse.verseKey} />
      )}
      <TranslationFeedbackAction
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
      />
      <VerseActionEmbedWidget
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
      />
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
