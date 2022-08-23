/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React, { useState, useEffect, useMemo } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import BookmarkedIcon from '../../../public/icons/bookmark.svg';
import CopyIcon from '../../../public/icons/copy.svg';
import LinkIcon from '../../../public/icons/east.svg';
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import TafsirVerseAction from '../QuranReader/TafsirView/TafsirVerseAction';

import VerseActionAdvancedCopy from './VerseActionAdvancedCopy';
import VerseActionRepeatAudio from './VerseActionRepeatAudio';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import WordByWordVerseAction from 'src/components/QuranReader/ReadingView/WordByWordVerseAction';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { addOrRemoveBookmark, getIsResourceBookmarked } from 'src/utils/auth/api';
import { makeBookmarksUrl, makeIsResourceBookmarkedUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { logButtonClick } from 'src/utils/eventLogger';
import { getVerseUrl } from 'src/utils/verse';
import BookmarkType from 'types/BookmarkType';
import { QuranFont } from 'types/QuranReader';
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
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const router = useRouter();
  const toast = useToast();
  const { cache, mutate: globalMutate } = useSWRConfig();

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const {
    data: isVerseBookmarkedData,
    isValidating: isVerseBookmarkedLoading,
    mutate,
  } = useSWRImmutable(
    isLoggedIn()
      ? makeIsResourceBookmarkedUrl(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        )
      : null,
    async () => {
      const response = await getIsResourceBookmarked(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      );
      return response;
    },
  );

  const isVerseBookmarked = useMemo(() => {
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && isVerseBookmarkedData) {
      return isVerseBookmarkedData;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    return false;
  }, [bookmarkedVerses, isVerseBookmarkedData, verse.verseKey]);

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
      .map((word) =>
        quranReaderStyles.quranFont === QuranFont.IndoPak ? word.textIndopak : word.textUthmani,
      )
      .join(' ');

    clipboardCopy(verseText).then(() => {
      setIsCopied(true);
    });
  };

  const verseUrl = getVerseUrl(verse.verseKey);
  const shouldShowGoToAyah = router.asPath !== verseUrl;
  const onToggleBookmarkClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_${
        isVerseBookmarked ? 'un_bookmark' : 'bookmark'
      }`,
    );

    if (isLoggedIn()) {
      // optimistic update, we are making assumption that the bookmark update will succeed
      mutate((currentIsVerseBookmarked) => !currentIsVerseBookmarked, {
        revalidate: false,
      });

      // when it's translation view, we need to invalidate the cached bookmarks range
      if (bookmarksRangeUrl) {
        const bookmarkedVersesRange = cache.get(bookmarksRangeUrl);
        const nextBookmarkedVersesRange = {
          ...bookmarkedVersesRange,
          [verse.verseKey]: !isVerseBookmarked,
        };
        globalMutate(bookmarksRangeUrl, nextBookmarkedVersesRange, {
          revalidate: false,
        });
      }

      cache.delete(
        makeBookmarksUrl(
          getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        ),
      );

      toast(isVerseBookmarked ? t('verse-bookmark-removed') : t('verse-bookmarked'), {
        status: ToastStatus.Success,
      });

      addOrRemoveBookmark(
        verse.chapterId as number,
        getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        BookmarkType.Ayah,
        !isVerseBookmarked,
        verse.verseNumber,
      ).catch((err) => {
        if (err.status === 400) {
          toast(t('common:error.bookmark-sync'), {
            status: ToastStatus.Error,
          });
          return;
        }
        toast(t('error.general'), {
          status: ToastStatus.Error,
        });
      });
    } else {
      dispatch(toggleVerseBookmark(verse.verseKey));
    }

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  const onGoToAyahClicked = () => {
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_go_to_verse`,
    );
    router.push(verseUrl);
  };

  let bookmarkIcon = <Spinner />;
  if (!isVerseBookmarkedLoading) {
    bookmarkIcon = isVerseBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />;
  }

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

      <PopoverMenu.Item
        onClick={onToggleBookmarkClicked}
        icon={bookmarkIcon}
        isDisabled={isVerseBookmarkedLoading}
      >
        {isVerseBookmarked ? `${t('bookmarked')}!` : `${t('bookmark')}`}
      </PopoverMenu.Item>

      <VerseActionRepeatAudio verseKey={verse.verseKey} />

      {shouldShowGoToAyah && (
        <PopoverMenu.Item onClick={onGoToAyahClicked} icon={<LinkIcon />}>
          {t('quran-reader:go-ayah')}
        </PopoverMenu.Item>
      )}
    </div>
  );
};

export default OverflowVerseActionsMenuBody;
