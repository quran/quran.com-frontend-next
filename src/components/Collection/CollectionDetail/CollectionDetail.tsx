import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import CollectionSorter from '../CollectionSorter/CollectionSorter';

import styles from './CollectionDetail.module.scss';
import CollectionVerseCell from './CollectionVerseCell';

import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { logButtonClick } from '@/utils/eventLogger';
import Button from 'src/components/dls/Button/Button';
import Bookmark from 'types/Bookmark';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

type CollectionDetailProps = {
  id: string;
  title: string;
  isOwner: boolean;
  bookmarks: Bookmark[];
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onItemDeleted?: (bookmarkId: string) => void;
  shouldShowTitle?: boolean;
};

const CollectionDetail = ({
  id,
  title,
  bookmarks,
  sortBy,
  onSortByChange,
  onItemDeleted,
  isOwner,
  shouldShowTitle = true,
}: CollectionDetailProps) => {
  const { t } = useTranslation();

  const sortOptions = [
    {
      id: CollectionDetailSortOption.RecentlyAdded,
      label: t('collection:recently-added'),
    },
    {
      id: CollectionDetailSortOption.VerseKey,
      label: t('collection:verse-key'),
    },
  ];

  const isCollectionEmpty = bookmarks.length === 0;

  const onBackToCollectionsClicked = () => {
    logButtonClick('back_to_collections_button', {
      collectionId: id,
    });
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          {shouldShowTitle && <div className={styles.title}>{title}</div>}
          {isOwner && (
            <CollectionSorter
              selectedOptionId={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              isSingleCollection
              collectionId={id}
            />
          )}
        </div>
        <div className={styles.collectionItemsContainer}>
          {isCollectionEmpty ? (
            <div className={styles.emptyCollectionContainer}>
              <span>{t('collection:empty')}</span>
              <div className={styles.backToCollectionButtonContainer}>
                <Button onClick={onBackToCollectionsClicked} href="/profile">
                  {t('collection:back-to-collection-list')}
                </Button>
              </div>
            </div>
          ) : (
            <Virtuoso
              data={bookmarks}
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
                />
              )}
            />
          )}
        </div>
      </div>
      <ConfirmationModal />
    </>
  );
};

export default CollectionDetail;
