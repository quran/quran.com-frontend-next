/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useIsMobile from '@/hooks/useIsMobile';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

interface Props {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
}

const BookmarkAction: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
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

  const onToggleBookmarkClicked = (e?: React.MouseEvent) => {
    // Prevent default to avoid page scroll
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Also stop propagation to prevent any parent handlers
    }

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
      if (bookmarkedVerses[verse.verseKey]) {
        toast(t('verse-bookmark-removed'), {
          status: ToastStatus.Success,
        });
      } else {
        toast(t('verse-bookmarked'), {
          status: ToastStatus.Success,
        });
      }
    }

    onActionTriggered?.();
  };

  let bookmarkIcon = <Spinner />;
  if (!isVerseBookmarkedLoading) {
    bookmarkIcon = isVerseBookmarked ? (
      <BookmarkedIcon color="var(--color-text-default)" />
    ) : (
      <IconContainer
        icon={<UnBookmarkedIcon />}
        color={IconColor.tertiary}
        size={IconSize.Custom}
        shouldFlipOnRTL={false}
      />
    );
  }

  // For use in the TopActions component (standalone button)
  if (isTranslationView || (!isTranslationView && isMobile)) {
    return (
      <Button
        size={ButtonSize.Small}
        tooltip={isVerseBookmarked ? t('bookmarked') : t('bookmark')}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        className={classNames(
          styles.iconContainer,
          styles.verseAction,
          'bookmark-verse-action-button',
        )}
        onClick={(e) => {
          onToggleBookmarkClicked(e);
        }}
        isDisabled={isVerseBookmarkedLoading}
        shouldFlipOnRTL={false}
        ariaLabel={isVerseBookmarked ? t('bookmarked') : t('bookmark')}
      >
        <span className={styles.icon}>{bookmarkIcon}</span>
      </Button>
    );
  }

  // For use in the overflow menu Reading Mode Desktop (PopoverMenu.Item)
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
