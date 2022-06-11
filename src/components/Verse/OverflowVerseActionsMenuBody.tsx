/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
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
import useSetPortalledZIndex from 'src/components/QuranReader/hooks/useSetPortalledZIndex';
import WordByWordVerseAction from 'src/components/QuranReader/ReadingView/WordByWordVerseAction';
import useBrowserLayoutEffect from 'src/hooks/useBrowserLayoutEffect';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { addOrRemoveBookmark, getIsResourceBookmarked } from 'src/utils/auth/api';
import { makeIsResourceBookmarkedUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { logButtonClick } from 'src/utils/eventLogger';
import { getVerseUrl } from 'src/utils/verse';
import BookmarkType from 'types/BookmarkType';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isPortalled?: boolean;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl: string;
}

const RESET_ACTION_TEXT_TIMEOUT_MS = 3 * 1000;
const DATA_POPOVER_PORTALLED = 'data-popover-portalled';

const OverflowVerseActionsMenuBody: React.FC<Props> = ({
  verse,
  isPortalled,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const { t } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { mutate: swrConfigMutate } = useSWRConfig();
  useSetPortalledZIndex(DATA_POPOVER_PORTALLED, isPortalled);

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const {
    data: isVerseBookmarked,
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

  /**
   * A hook that will run once to check if the body is portalled or not and if it is,
   * will override the zIndex value manually to 1 so that it doesn't stack on top of
   * the advanced copy/tafsirs modals since the default behavior of Radix is to set
   * a really high value of the zIndex of the container of the portalled component which
   * cause it to be on always on top of our custom Modal.
   */
  useBrowserLayoutEffect(() => {
    // eslint-disable-next-line i18next/no-literal-string
    const portalledElement = window.document.querySelector(`[${DATA_POPOVER_PORTALLED}="true"]`);
    if (portalledElement) {
      // we need to react a few elements up the tree to get to the container that we want to override its zIndex
      const radixPortalElement = portalledElement.closest('[data-radix-portal]') as HTMLElement;
      if (radixPortalElement) {
        radixPortalElement.style.zIndex = '1';
      }
    }
  }, [isPortalled]);

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

    addOrRemoveBookmark(
      verse.chapterId as number,
      getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
      BookmarkType.Ayah,
      !isVerseBookmarked,
      verse.verseNumber,
    )
      .then(() => {
        mutate((currentIsVerseBookmarked) => !currentIsVerseBookmarked);
        // when it's translation view, we need to invalidate the cached bookmarks range
        if (bookmarksRangeUrl) {
          swrConfigMutate(bookmarksRangeUrl);
        }
        toast(isVerseBookmarked ? t('verse-bookmark-removed') : t('verse-bookmarked'), {
          status: ToastStatus.Success,
        });
      })
      .catch((err) => {
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
    <div
      {...{
        [DATA_POPOVER_PORTALLED]: isPortalled,
      }}
    >
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

      <PopoverMenu.Item onClick={onToggleBookmarkClicked} icon={bookmarkIcon}>
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
