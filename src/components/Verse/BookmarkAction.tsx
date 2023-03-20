/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { addBookmark, deleteBookmarkById, getBookmark } from 'src/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from 'src/utils/auth/apiPaths';
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
    data: bookmark,
    isValidating: isVerseBookmarkedLoading,
    mutate,
  } = useSWRImmutable(
    isLoggedIn()
      ? makeBookmarkUrl(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        )
      : null,
    async () => {
      const response = await getBookmark(
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
    if (isUserLoggedIn && bookmark) {
      return bookmark;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    return false;
  }, [bookmarkedVerses, bookmark, verse.verseKey]);

  const updateInBookmarkRange = (value) => {
    // when it's translation view, we need to invalidate the cached bookmarks range
    if (bookmarksRangeUrl) {
      const bookmarkedVersesRange = cache.get(bookmarksRangeUrl);
      const nextBookmarkedVersesRange = {
        ...bookmarkedVersesRange,
        [verse.verseKey]: value,
      };
      globalMutate(bookmarksRangeUrl, nextBookmarkedVersesRange, {
        revalidate: false,
      });
    }
  };

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

      if (isVerseBookmarked) {
        mutate(() => null, {
          revalidate: false,
        });
      }

      cache.delete(
        makeBookmarksUrl(
          getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        ),
      );

      if (!isVerseBookmarked) {
        addBookmark({
          key: Number(verse.chapterId),
          mushafId,
          type: BookmarkType.Ayah,
          verseNumber: verse.verseNumber,
        })
          .then((newBookmark) => {
            mutate();
            updateInBookmarkRange(newBookmark);
            toast(t('verse-bookmarked'), {
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
      } else {
        deleteBookmarkById(bookmark.id).then(() => {
          updateInBookmarkRange(null);
          toast(t('verse-bookmark-removed'), {
            status: ToastStatus.Success,
          });
        });
      }
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
