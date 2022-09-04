/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import BookmarkedIcon from '../../../public/icons/bookmark.svg';
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import Spinner from 'src/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { addOrRemoveBookmark, getIsResourceBookmarked } from 'src/utils/auth/api';
import { makeBookmarksUrl, makeIsResourceBookmarkedUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { logButtonClick } from 'src/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

const BookmarkAction = ({ verse, isTranslationView, onActionTriggered, bookmarksRangeUrl }) => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const toast = useToast();
  const { cache, mutate: globalMutate } = useSWRConfig();

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

      addOrRemoveBookmark({
        key: Number(verse.chapterId),
        mushafId,
        type: BookmarkType.Ayah,
        isAdd: isVerseBookmarked,
        verseNumber: verse.verseNumber,
      }).catch((err) => {
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

  let bookmarkIcon = <Spinner />;
  if (!isVerseBookmarkedLoading) {
    bookmarkIcon = isVerseBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />;
  }

  return (
    <>
      <PopoverMenu.Item
        onClick={onToggleBookmarkClicked}
        icon={bookmarkIcon}
        isDisabled={isVerseBookmarkedLoading}
      >
        {isVerseBookmarked ? `${t('bookmarked')}!` : `${t('bookmark')}`}
      </PopoverMenu.Item>
    </>
  );
};

export default BookmarkAction;
