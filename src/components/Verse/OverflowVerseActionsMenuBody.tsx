import React, { useState, useEffect } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import BookmarkAction from './BookmarkAction';
import SaveToCollectionAction from './SaveToCollectionAction';
import VerseActionAdvancedCopy from './VerseActionAdvancedCopy';
import VerseActionRepeatAudio from './VerseActionRepeatAudio';

import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import TafsirVerseAction from '@/components/QuranReader/TafsirView/TafsirVerseAction';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import CopyIcon from '@/icons/copy.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getWordTextFieldNameByFont } from '@/utils/word';
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
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

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
    const verseText = verse.words
      .map((word) => word[getWordTextFieldNameByFont(quranReaderStyles.quranFont)])
      .join(' ');
    clipboardCopy(verseText).then(() => {
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
      {isLoggedIn() ? (
        <SaveToCollectionAction verse={verse} bookmarksRangeUrl={bookmarksRangeUrl} />
      ) : null}

      <VerseActionRepeatAudio verseKey={verse.verseKey} />
    </div>
  );
};

export default OverflowVerseActionsMenuBody;
