import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import TranslationFeedbackAction from '../TranslationFeedback/TranslationFeedbackAction';
import VerseActionAdvancedCopy from '../VerseActionAdvancedCopy';
import VerseActionRepeatAudio from '../VerseActionRepeatAudio';

import ShareVerseActionsMenu from './ShareVerseActionsMenu';

import VerseActionsMenuType from '@/components/QuranReader/ReadingView/WordActionsMenu/types';
import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import { selectStudyModeIsOpen } from '@/redux/slices/QuranReader/studyMode';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
  isInsideStudyMode?: boolean;
}

const OverflowVerseActionsMenuBody: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl, // eslint-disable-line @typescript-eslint/no-unused-vars
  isInsideStudyMode = false,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<VerseActionsMenuType>(VerseActionsMenuType.Main);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

  return selectedMenu === VerseActionsMenuType.Main ? (
    <div>
      <VerseActionAdvancedCopy
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={isTranslationView}
        isInsideStudyMode={isInsideStudyMode}
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
        isInsideStudyMode={isInsideStudyMode}
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
