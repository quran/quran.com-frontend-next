import React, { useCallback, useContext } from 'react';

import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './CollectionVerseCell.module.scss';
import CollectionVerseCellMenu from './CollectionVerseCellMenu';
import CollectionVerseCellProps from './CollectionVerseCellTypes';
import VerseDisplay from './VerseDisplay';

import Checkbox from '@/components/dls/Forms/Checkbox/Checkbox';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import Separator from '@/dls/Separator/Separator';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import ArrowIcon from '@/icons/arrow.svg';
import { selectPinnedVerseKeysSet } from '@/redux/slices/QuranReader/pinnedVerses';
import { getChapterData } from '@/utils/chapter';
import { dateToMonthDayYearFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { navigateToExternalUrl } from '@/utils/url';
import { makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const CollectionVerseCell: React.FC<CollectionVerseCellProps> = ({
  bookmarkId,
  chapterId,
  verseNumber,
  collectionId,
  collectionName,
  isOwner,
  createdAt,
  isSelectMode = false,
  isSelected = false,
  isExpanded = false,
  onDelete,
  onToggleSelection,
  onToggleExpansion,
}) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const confirm = useConfirm();
  const { pinVerseWithSync, unpinVerseWithSync } = usePinnedVerseSync();
  const pinnedVerseKeysSet = useSelector(selectPinnedVerseKeysSet);

  const verseKey = makeVerseKey(chapterId, verseNumber);
  const isPinned = pinnedVerseKeysSet.has(verseKey);
  const chapterData = getChapterData(chaptersData, chapterId.toString());
  const localizedVerseKey = toLocalizedVerseKey(verseKey, lang);
  const bookmarkName = `${chapterData?.transliteratedName} ${localizedVerseKey}`;

  const formattedDate = React.useMemo(() => {
    if (!createdAt) return null;
    return dateToMonthDayYearFormat(createdAt, lang);
  }, [createdAt, lang]);

  const handlePinToggle = useCallback(() => {
    if (isPinned) {
      logButtonClick('collection_detail_unpin_verse', { verseKey });
      unpinVerseWithSync(verseKey);
    } else {
      logButtonClick('collection_detail_pin_verse', { verseKey });
      pinVerseWithSync(verseKey);
    }
  }, [isPinned, verseKey, pinVerseWithSync, unpinVerseWithSync]);

  const handleGoToAyah = () => {
    logButtonClick('collection_detail_go_to_ayah_menu', { verseKey, collectionId });
    navigateToExternalUrl(getVerseNavigationUrlByVerseKey(verseKey));
  };

  const handleDelete = async () => {
    logButtonClick('collection_detail_delete_menu');

    const isConfirmed = await confirm({
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      title: t('collection:delete-bookmark.title'),
      subtitle: t('collection:delete-bookmark.subtitle', { bookmarkName, collectionName }),
    });

    if (isConfirmed) {
      logButtonClick('bookmark_delete_confirm', { verseKey, collectionId });
      if (onDelete) onDelete(bookmarkId);
    } else {
      logButtonClick('bookmark_delete_confirm_cancel', { verseKey, collectionId });
    }
  };

  return (
    <div className={styles.outerContainer}>
      <div className={styles.container}>
        <div
          className={styles.headerContainer}
          onClick={() => onToggleExpansion?.(bookmarkId)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onToggleExpansion?.(bookmarkId);
          }}
        >
          <div className={styles.headerLeft}>
            <Link
              href={getVerseNavigationUrlByVerseKey(verseKey)}
              className={styles.verseReference}
              onClick={(e) => e.stopPropagation()}
            >
              {bookmarkName}
            </Link>
            {formattedDate && <div className={styles.bookmarkDate}>{formattedDate}</div>}
          </div>
          <div className={styles.headerRight}>
            {isSelectMode ? (
              <Checkbox
                id={`checkbox-${bookmarkId}`}
                checked={isSelected}
                onChange={() => onToggleSelection?.(bookmarkId)}
                onClick={(e) => e.stopPropagation()}
                checkboxClassName={styles.checkbox}
                containerClassName={styles.checkboxContainer}
              />
            ) : (
              <CollectionVerseCellMenu
                isPinned={isPinned}
                isOwner={isOwner}
                onPinToggle={handlePinToggle}
                onDelete={handleDelete}
                onGoToAyah={handleGoToAyah}
              />
            )}
            <div className={styles.iconButton}>
              <ArrowIcon className={isExpanded ? styles.arrowUp : styles.arrowDown} />
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator className={styles.contentSeparator} />
            <div className={styles.cellContainer} data-verse-key={verseKey}>
              <VerseDisplay chapterId={chapterId} verseNumber={verseNumber} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionVerseCell;
