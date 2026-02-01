import React, { useContext } from 'react';

import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionVerseCell.module.scss';
import VerseDisplay from './VerseDisplay';

import Checkbox from '@/components/dls/Forms/Checkbox/Checkbox';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import Separator from '@/dls/Separator/Separator';
import ArrowIcon from '@/icons/arrow.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { getChapterData } from '@/utils/chapter';
import { dateToMonthDayYearFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { navigateToExternalUrl } from '@/utils/url';
import { makeVerseKey } from '@/utils/verse';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import DataContext from 'src/contexts/DataContext';

type CollectionVerseCellProps = {
  bookmarkId: string;
  chapterId: number;
  verseNumber: number;
  collectionId: string;
  collectionName: string;
  isOwner: boolean;
  onDelete?: (bookmarkId: string) => void;
  createdAt?: string;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (bookmarkId: string) => void;
  isExpanded?: boolean;
  onToggleExpansion?: (bookmarkId: string) => void;
};

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

  const verseKey = makeVerseKey(chapterId, verseNumber);
  const chapterData = getChapterData(chaptersData, chapterId.toString());
  const localizedVerseKey = toLocalizedVerseKey(verseKey, lang);
  const bookmarkName = `${chapterData?.transliteratedName} ${localizedVerseKey}`;

  const formattedDate = React.useMemo(() => {
    if (!createdAt) return null;
    return dateToMonthDayYearFormat(createdAt, lang);
  }, [createdAt, lang]);

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

    const eventData = { verseKey, collectionId };

    if (isConfirmed) {
      logButtonClick('bookmark_delete_confirm', eventData);
      if (onDelete) onDelete(bookmarkId);
    } else {
      logButtonClick('bookmark_delete_confirm_cancel', eventData);
    }
  };

  return (
    <div className={styles.outerContainer}>
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
            <PopoverMenu
              trigger={
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t('common:more')}
                  className={styles.iconButton}
                >
                  <OverflowMenuIcon className={styles.dot3} />
                </button>
              }
            >
              {isOwner && (
                <PopoverMenu.Item onClick={handleDelete}>{t('common:delete')}</PopoverMenu.Item>
              )}
              <PopoverMenu.Item onClick={handleGoToAyah} shouldCloseMenuAfterClick>
                {t('collection:go-to-ayah')}
              </PopoverMenu.Item>
            </PopoverMenu>
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
  );
};

export default CollectionVerseCell;
