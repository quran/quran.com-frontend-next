/* eslint-disable max-lines */
import React, { useCallback, useContext, useState } from 'react';

import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './CollectionVerseCell.module.scss';
import CollectionVerseCellMenu from './CollectionVerseCellMenu';
import CollectionVerseCellProps from './CollectionVerseCellTypes';
import buildVerseCopyText from './utils/buildVerseCopyText';
import fetchVerseForCopy from './utils/fetchVerseForCopy';
import VerseDisplay from './VerseDisplay';

import DeleteBookmarkModal from '@/components/Collection/DeleteBookmarkModal/DeleteBookmarkModal';
import Checkbox from '@/components/dls/Forms/Checkbox/Checkbox';
import Separator from '@/dls/Separator/Separator';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import ArrowIcon from '@/icons/arrow.svg';
import { RootState } from '@/redux/RootState';
import { selectPinnedVerseKeysSet } from '@/redux/slices/QuranReader/pinnedVerses';
import { areArraysEqual } from '@/utils/array';
import { textToBlob } from '@/utils/blob';
import { getChapterData } from '@/utils/chapter';
import copyText from '@/utils/copyText';
import { dateToMonthDayYearFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { QURAN_URL, getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
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
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const toast = useToast();
  const { pinVerseWithSync, unpinVerseWithSync } = usePinnedVerseSync();
  const pinnedVerseKeysSet = useSelector(selectPinnedVerseKeysSet);
  const selectedTranslations = useSelector(
    (state: RootState) => state.translations?.selectedTranslations ?? [],
    areArraysEqual,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDelete = () => {
    logButtonClick('collection_detail_delete_menu');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    logButtonClick('bookmark_delete_confirm', { verseKey, collectionId });
    setIsDeleteModalOpen(false);
    onDelete?.(bookmarkId);
  };

  const handleDeleteCancel = () => {
    logButtonClick('bookmark_delete_confirm_cancel', { verseKey, collectionId });
    setIsDeleteModalOpen(false);
  };

  const handleCopy = async () => {
    // Build the blob promise and invoke clipboard copy immediately to preserve user activation.
    const textBlobPromise = (async () => {
      const verse = await fetchVerseForCopy(verseKey, (selectedTranslations as number[]) || []);
      const qdcUrl = `${QURAN_URL}${getVerseNavigationUrlByVerseKey(verseKey)}`;
      const text = buildVerseCopyText({ verse, chapter: chapterData, lang, qdcUrl });
      return textToBlob(text);
    })();

    const copyPromise = copyText(textBlobPromise);

    try {
      await copyPromise;
      toast(`${t('common:copied')}!`, { status: ToastStatus.Success });
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  };

  const handleShare = () => {
    logButtonClick('collection_detail_share_menu', { verseKey, collectionId });
    onShare?.(verseKey);
  };

  return (
    <>
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
