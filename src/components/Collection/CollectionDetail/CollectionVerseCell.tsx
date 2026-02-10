import React, { useCallback, useContext } from 'react';

import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './CollectionVerseCell.module.scss';
import CollectionVerseCellMenu from './CollectionVerseCellMenu';
import CollectionVerseCellProps from './CollectionVerseCellTypes';
import useCollectionVerseCellActions from './hooks/useCollectionVerseCellActions';
import VerseDisplay from './VerseDisplay';

import DeleteBookmarkModal from '@/components/Collection/DeleteBookmarkModal/DeleteBookmarkModal';
import Checkbox from '@/components/dls/Forms/Checkbox/Checkbox';
import Separator from '@/dls/Separator/Separator';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import ArrowIcon from '@/icons/arrow.svg';
import { selectPinnedVerseKeysSet } from '@/redux/slices/QuranReader/pinnedVerses';
import { getChapterData } from '@/utils/chapter';
import { dateToMonthDayYearFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { isRTLLocale, toLocalizedVerseKey, toLocalizedVerseKeyRTL } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const SINGLE_ITEM_COUNT = 1;

const CollectionVerseCell: React.FC<CollectionVerseCellProps> = ({
  bookmarkId,
  chapterId,
  verseNumber,
  collectionId,
  collectionName,
  isOwner,
  onShare,
  createdAt,
  isSelectMode = false,
  isSelected = false,
  isExpanded = false,
  onDelete,
  onToggleSelection,
  onToggleExpansion,
}) => {
  const { lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const { pinVerseWithSync, unpinVerseWithSync } = usePinnedVerseSync();
  const pinnedVerseKeysSet = useSelector(selectPinnedVerseKeysSet);

  const verseKey = makeVerseKey(chapterId, verseNumber);
  const isPinned = pinnedVerseKeysSet.has(verseKey);
  const chapterData = getChapterData(chaptersData, chapterId.toString());
  const isRTL = isRTLLocale(lang);
  const localizedVerseKey = isRTL
    ? toLocalizedVerseKeyRTL(verseKey, lang)
    : toLocalizedVerseKey(verseKey, lang);
  const surahName =
    (isRTL ? chapterData?.nameArabic : chapterData?.transliteratedName) ??
    chapterData?.transliteratedName;
  const bookmarkName = `${surahName || ''} ${localizedVerseKey}`.trim();

  const formattedDate = createdAt ? dateToMonthDayYearFormat(createdAt, lang) : null;

  const handlePinToggle = useCallback(() => {
    if (isPinned) {
      logButtonClick('collection_detail_unpin_verse', { verseKey });
      unpinVerseWithSync(verseKey);
    } else {
      logButtonClick('collection_detail_pin_verse', { verseKey });
      pinVerseWithSync(verseKey);
    }
  }, [isPinned, verseKey, pinVerseWithSync, unpinVerseWithSync]);

  const {
    isDeleteModalOpen,
    handleCopy,
    handleShare,
    handleDelete,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useCollectionVerseCellActions({
    bookmarkId,
    verseKey,
    collectionId,
    chapterData,
    onShare,
    onDelete,
  });

  const handleToggleExpansion = useCallback(
    () => onToggleExpansion?.(bookmarkId),
    [bookmarkId, onToggleExpansion],
  );

  return (
    <>
      <div className={styles.outerContainer}>
        <div className={styles.container}>
          <div
            className={styles.headerContainer}
            onClick={handleToggleExpansion}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggleExpansion()}
          >
            <div className={styles.headerLeft}>
              <Link
                href={getVerseNavigationUrlByVerseKey(verseKey)}
                className={styles.verseReference}
                onClick={(e) => e.stopPropagation()}
              >
                {bookmarkName}
              </Link>
              {isOwner && formattedDate && (
                <div className={styles.bookmarkDate}>{formattedDate}</div>
              )}
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
                  onShare={handleShare}
                  onCopy={handleCopy}
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
      <DeleteBookmarkModal
        isOpen={isDeleteModalOpen}
        count={SINGLE_ITEM_COUNT}
        collectionName={collectionName}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default CollectionVerseCell;
