import React, { useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionVerseCell.module.scss';
import VerseDisplay from './VerseDisplay';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import Separator from '@/dls/Separator/Separator';
import ChevronDownIcon from '@/icons/chevron-down.svg';
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
};

const CollectionVerseCell: React.FC<CollectionVerseCellProps> = ({
  bookmarkId,
  chapterId,
  verseNumber,
  collectionId,
  collectionName,
  isOwner,
  onDelete,
  createdAt,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
    logButtonClick('collection_detail_go_to_ayah_menu', {
      verseKey,
      collectionId,
    });
    navigateToExternalUrl(getVerseNavigationUrlByVerseKey(verseKey));
  };

  const handleDelete = async () => {
    logButtonClick('collection_detail_delete_menu');

    const isConfirmed = await confirm({
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      title: t('collection:delete-bookmark.title'),
      subtitle: t('collection:delete-bookmark.subtitle', {
        bookmarkName,
        collectionName,
      }),
    });

    const eventData = {
      verseKey,
      collectionId,
    };

    if (isConfirmed) {
      logButtonClick('bookmark_delete_confirm', eventData);
      if (onDelete) {
        onDelete(bookmarkId);
      }
    } else {
      logButtonClick('bookmark_delete_confirm_cancel', eventData);
    }
  };

  return (
    <div className={styles.outerContainer}>
      <div
        className={styles.headerContainer}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className={styles.headerLeft}>
          <div className={styles.verseReference}>{bookmarkName}</div>
          {formattedDate && <div className={styles.bookmarkDate}>{formattedDate}</div>}
        </div>
        <div className={styles.headerRight}>
          <PopoverMenu
            trigger={
              <Button
                variant={ButtonVariant.Ghost}
                className={styles.menuButton}
                onClick={(e) => e.stopPropagation()}
              >
                <OverflowMenuIcon />
              </Button>
            }
          >
            {isOwner && (
              <PopoverMenu.Item onClick={handleDelete}>{t('common:delete')}</PopoverMenu.Item>
            )}
            <PopoverMenu.Item onClick={handleGoToAyah} shouldCloseMenuAfterClick>
              {t('collection:go-to-ayah')}
            </PopoverMenu.Item>
          </PopoverMenu>
          <div className={styles.chevronButton}>
            <ChevronDownIcon className={isOpen ? styles.chevronUp : styles.chevronDown} />
          </div>
        </div>
      </div>

      {isOpen && (
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
