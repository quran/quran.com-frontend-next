/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unused-prop-types */

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import { getMyQuranNavigationUrl } from '../../../utils/navigation';

import styles from './CollectionDetail.module.scss';
import CollectionVerseCell from './CollectionVerseCell';

import MyQuranTab from '@/components/MyQuran/tabs';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { CollectionDetailSortOption } from '@/types/CollectionSortOptions';
import { logButtonClick } from '@/utils/eventLogger';
import Button from 'src/components/dls/Button/Button';
import Bookmark from 'types/Bookmark';

type CollectionDetailProps = {
  id: string;
  title: string;
  isOwner: boolean;
  bookmarks: Bookmark[];

  onItemDeleted?: (bookmarkId: string) => void;
  shouldShowTitle?: boolean;
  onBack?: () => void;

  // TODO: Remove these props when the collection detail page is updated to use the new collection detail view
  onSortByChange?: (newVal: CollectionDetailSortOption) => void;
  sortBy?: CollectionDetailSortOption;

  isSelectMode?: boolean;
  onToggleBookmarkSelection?: (bookmarkId: string) => void;
  onToggleCardExpansion?: (bookmarkId: string) => void;
  isCardExpanded?: (bookmarkId: string) => boolean;
  isBookmarkSelected?: (bookmarkId: string) => boolean;
};

// Enable scroll only when the collection has more than 5 items: this roughly matches the
// number of cards that fit in the available viewport height in our layouts, so smaller
// collections render without a scrollable container while larger ones become scrollable.
const SCROLL_THRESHOLD = 5;

const CollectionDetail = ({
  id,
  title,
  bookmarks,
  onItemDeleted,
  isOwner,
  shouldShowTitle = true,
  onBack,
  isSelectMode = false,
  onToggleBookmarkSelection,
  onToggleCardExpansion,
  isCardExpanded,
  isBookmarkSelected,
}: CollectionDetailProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const isCollectionEmpty = bookmarks.length === 0;
  const hasScroll = bookmarks.length > SCROLL_THRESHOLD;

  const onBackToCollectionsClicked = () => {
    logButtonClick('back_to_collections_button', {
      collectionId: id,
    });
    if (onBack) {
      onBack();
    } else {
      router.push(getMyQuranNavigationUrl(MyQuranTab.SAVED));
    }
  };

  const itemsContent = isCollectionEmpty ? (
    <div className={styles.emptyCollectionContainer}>
      <span>{t('collection:empty')}</span>
      <div className={styles.backToCollectionButtonContainer}>
        <Button onClick={onBackToCollectionsClicked}>
          {t('collection:back-to-collection-list')}
        </Button>
      </div>
    </div>
  ) : hasScroll ? (
    <Virtuoso
      data={bookmarks}
      overscan={10}
      increaseViewportBy={100}
      itemContent={(index, bookmark) => (
        <CollectionVerseCell
          key={bookmark.id}
          bookmarkId={bookmark.id}
          chapterId={bookmark.key}
          verseNumber={bookmark.verseNumber}
          collectionId={id}
          collectionName={title}
          isOwner={isOwner}
          onDelete={onItemDeleted}
          createdAt={bookmark.createdAt}
          isSelectMode={isSelectMode}
          isSelected={isBookmarkSelected?.(bookmark.id)}
          onToggleSelection={onToggleBookmarkSelection}
          isExpanded={isCardExpanded?.(bookmark.id)}
          onToggleExpansion={onToggleCardExpansion}
        />
      )}
    />
  ) : (
    bookmarks.map((bookmark) => (
      <CollectionVerseCell
        key={bookmark.id}
        bookmarkId={bookmark.id}
        chapterId={bookmark.key}
        verseNumber={bookmark.verseNumber}
        collectionId={id}
        collectionName={title}
        isOwner={isOwner}
        onDelete={onItemDeleted}
        createdAt={bookmark.createdAt}
        isSelectMode={isSelectMode}
        isSelected={isBookmarkSelected?.(bookmark.id)}
        onToggleSelection={onToggleBookmarkSelection}
        isExpanded={isCardExpanded?.(bookmark.id)}
        onToggleExpansion={onToggleCardExpansion}
      />
    ))
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          {shouldShowTitle && <div className={styles.title}>{title}</div>}
        </div>
        <div className={`${styles.collectionItemsContainer} ${hasScroll ? styles.hasScroll : ''}`}>
          {itemsContent}
        </div>
      </div>
      <ConfirmationModal />
    </>
  );
};

export default CollectionDetail;
