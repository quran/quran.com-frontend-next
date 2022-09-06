/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import CopyIcon from '../../../public/icons/copy.svg';
import TafsirVerseAction from '../QuranReader/TafsirView/TafsirVerseAction';

import BookmarkAction from './BookmarkAction';
import SaveToCollectionAction from './SaveToCollectionAction';
import VerseActionAdvancedCopy from './VerseActionAdvancedCopy';
import VerseActionRepeatAudio from './VerseActionRepeatAudio';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import WordByWordVerseAction from 'src/components/QuranReader/ReadingView/WordByWordVerseAction';
import { logButtonClick } from 'src/utils/eventLogger';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl: string;
}

const RESET_ACTION_TEXT_TIMEOUT_MS = 3 * 1000;

const OverflowVerseActionsMenuBody: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const { t } = useTranslation('common');
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
        if (onActionTriggered) {
          onActionTriggered();
        }
      }, RESET_ACTION_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied, onActionTriggered]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just clicked the share action, we should change the text back after 3 seconds.
    if (isShared === true) {
      timeoutId = setTimeout(() => setIsShared(false), RESET_ACTION_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isShared]);

  const onCopyClicked = () => {
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_copy`,
    );
    clipboardCopy(verse.textUthmani).then(() => {
      setIsCopied(true);
    });
  };

  return (
    <div>
      <PopoverMenu.Item onClick={onCopyClicked} icon={<CopyIcon />}>
        {isCopied ? `${t('copied')}!` : `${t('copy')}`}
      </PopoverMenu.Item>

      <VerseActionAdvancedCopy
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={isTranslationView}
      />
      {!isTranslationView && (
        <WordByWordVerseAction verse={verse} onActionTriggered={onActionTriggered} />
      )}
      <TafsirVerseAction
        chapterId={Number(verse.chapterId)}
        verseNumber={verse.verseNumber}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
      />

      <BookmarkAction
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
        bookmarksRangeUrl={bookmarksRangeUrl}
      />
      <SaveToCollectionAction verse={verse} bookmarksRangeUrl={bookmarksRangeUrl} />

      <VerseActionRepeatAudio verseKey={verse.verseKey} />
    </div>
  );
};

export default OverflowVerseActionsMenuBody;
