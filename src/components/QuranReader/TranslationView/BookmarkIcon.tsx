/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import BookmarkedIcon from '@/icons/bookmark.svg';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { deleteBookmarkById } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
import Verse from 'types/Verse';

type Props = {
  verse: Verse;
  pageBookmarks: BookmarksMap | undefined;
  bookmarksRangeUrl: string;
};

const BookmarkIcon: React.FC<Props> = ({ verse, pageBookmarks, bookmarksRangeUrl }) => {
  const { t } = useTranslation('quran-reader');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const { cache, mutate } = useSWRConfig();
  const toast = useToast();
  const dispatch = useDispatch();

  const isVerseBookmarked = useMemo(() => {
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && pageBookmarks) {
      return !!pageBookmarks[verse.verseKey];
    }
    return !!bookmarkedVerses[verse.verseKey];
  }, [bookmarkedVerses, pageBookmarks, verse.verseKey]);

  if (!isVerseBookmarked) return null;

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const onClick = () => {
    logButtonClick('translation_view_un_bookmark_verse');

    if (isLoggedIn()) {
      const bookmarkedVersesRange = cache.get(bookmarksRangeUrl);
      const nextBookmarkedVersesRange = {
        ...bookmarkedVersesRange,
        [verse.verseKey]: !isVerseBookmarked,
      };
      mutate(bookmarksRangeUrl, nextBookmarkedVersesRange, {
        revalidate: false,
      });

      cache.delete(
        makeBookmarkUrl(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        ),
      );

      const bookmarkId = pageBookmarks[verse.verseKey].id;
      if (bookmarkId) {
        deleteBookmarkById(bookmarkId).catch((err) => {
          if (err.status === 400) {
            toast(t('common:error.bookmark-sync'), {
              status: ToastStatus.Error,
            });
            return;
          }
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
      }
    } else {
      dispatch(toggleVerseBookmark(verse.verseKey));
    }
  };

  return (
    <Button
      className={classNames(styles.iconContainer, styles.verseAction)}
      onClick={onClick}
      tooltip={t('remove-bookmark')}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
    >
      <BookmarkedIcon />
    </Button>
  );
};

export default BookmarkIcon;
