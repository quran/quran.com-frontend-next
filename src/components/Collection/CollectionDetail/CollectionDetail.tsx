import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import { getMyQuranNavigationUrl } from '../../../utils/navigation';

import styles from './CollectionDetail.module.scss';
import CollectionVerseCell from './CollectionVerseCell';

import MyQuranTab from '@/components/MyQuran/tabs';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { logButtonClick } from '@/utils/eventLogger';
import Button from 'src/components/dls/Button/Button';
import Bookmark from 'types/Bookmark';

// Largest collection size that will be rendered without virtualization.
// Virtualization is enabled when the bookmark count is strictly greater than
// MAX_NON_VIRTUALIZED_BOOKMARKS (i.e., > 12). Smaller lists are rendered
// normally as they do not significantly benefit from virtualization and keep
// the DOM simpler for better UX at low counts.
const MAX_NON_VIRTUALIZED_BOOKMARKS = 12;
const VIRTUALIZED_LIST_HEIGHT_CSS = 'calc(var(--spacing-mega-px) * 6)';

type CollectionDetailProps = {
  id: string;
  title: string;
  isOwner: boolean;
  bookmarks: Bookmark[];
  emptyMessage?: string;

  onItemDeleted?: (bookmarkId: string) => void;
  onShareVerse?: (verseKey: string) => void;
  onBack?: () => void;

  isSelectMode?: boolean;
  shouldUseBodyScroll?: boolean;
  onEndReached?: () => void;
  hasMore?: boolean;
  isVirtualizeForced?: boolean;
  onToggleBookmarkSelection?: (bookmarkId: string) => void;
  onToggleCardExpansion?: (bookmarkId: string) => void;
  isCardExpanded?: (bookmarkId: string) => boolean;
  isBookmarkSelected?: (bookmarkId: string) => boolean;
};

const CollectionDetail = ({
  id,
  title,
  bookmarks,
  onItemDeleted,
  onShareVerse,
  isOwner,
  onBack,
  emptyMessage,
  isSelectMode = false,
  shouldUseBodyScroll = false,
  onEndReached,
  hasMore = false,
  isVirtualizeForced = false,
  onToggleBookmarkSelection,
  onToggleCardExpansion,
  isCardExpanded,
  isBookmarkSelected,
}: CollectionDetailProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const isCollectionEmpty = bookmarks.length === 0;

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

  const shouldVirtualize =
    isVirtualizeForced ||
    !!(onEndReached && hasMore) ||
    bookmarks.length > MAX_NON_VIRTUALIZED_BOOKMARKS;

  const renderBookmarkCell = (bookmark: Bookmark) => (
    <CollectionVerseCell
      key={bookmark.id}
      bookmarkId={bookmark.id}
      chapterId={bookmark.key}
      verseNumber={bookmark.verseNumber}
      collectionId={id}
      collectionName={title}
      isOwner={isOwner}
      onDelete={onItemDeleted}
      onShare={onShareVerse}
      createdAt={bookmark.createdAt}
      isSelectMode={isSelectMode}
      isSelected={isBookmarkSelected?.(bookmark.id)}
      onToggleSelection={onToggleBookmarkSelection}
      isExpanded={isCardExpanded?.(bookmark.id)}
      onToggleExpansion={onToggleCardExpansion}
    />
  );

  const listContent = (() => {
    if (shouldUseBodyScroll) {
      return (
        <Virtuoso
          data={bookmarks}
          overscan={10}
          increaseViewportBy={100}
          useWindowScroll
          {...(onEndReached && hasMore && { endReached: onEndReached })}
          itemContent={(index, bookmark) => renderBookmarkCell(bookmark)}
        />
      );
    }

    if (shouldVirtualize) {
      return (
        <Virtuoso
          className={styles.virtualizedList}
          style={{ height: VIRTUALIZED_LIST_HEIGHT_CSS }}
          data={bookmarks}
          overscan={10}
          increaseViewportBy={100}
          {...(onEndReached && hasMore && { endReached: onEndReached })}
          itemContent={(index, bookmark) => renderBookmarkCell(bookmark)}
        />
      );
    }

    return bookmarks.map(renderBookmarkCell);
  })();

  return (
    <>
      <div className={styles.container}>
        <div
          className={classNames(styles.collectionItemsContainer, {
            [styles.bodyScroll]: shouldUseBodyScroll,
          })}
        >
          {isCollectionEmpty ? (
            <div className={styles.emptyCollectionContainer}>
              <span>{emptyMessage || t('collection:empty')}</span>
              <div className={styles.backToCollectionButtonContainer}>
                <Button onClick={onBackToCollectionsClicked}>
                  {t('collection:back-to-collection-list')}
                </Button>
              </div>
            </div>
          ) : (
            listContent
          )}
        </div>
      </div>
      <ConfirmationModal />
    </>
  );
};

export default CollectionDetail;
