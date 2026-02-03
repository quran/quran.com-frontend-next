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

type CollectionDetailProps = {
  id: string;
  title: string;
  isOwner: boolean;
  bookmarks: Bookmark[];

  onItemDeleted?: (bookmarkId: string) => void;
  onBack?: () => void;

  isSelectMode?: boolean;
  shouldUseBodyScroll?: boolean;
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
  isOwner,
  onBack,
  isSelectMode = false,
  shouldUseBodyScroll = false,
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

  return (
    <>
      <div className={styles.container}>
        <div className={styles.separator} />
        <div
          className={classNames(styles.collectionItemsContainer, {
            [styles.bodyScroll]: shouldUseBodyScroll,
          })}
        >
          {isCollectionEmpty ? (
            <div className={styles.emptyCollectionContainer}>
              <span>{t('collection:empty')}</span>
              <div className={styles.backToCollectionButtonContainer}>
                <Button onClick={onBackToCollectionsClicked}>
                  {t('collection:back-to-collection-list')}
                </Button>
              </div>
            </div>
          ) : (
            <Virtuoso
              data={bookmarks}
              overscan={10}
              increaseViewportBy={100}
              useWindowScroll={shouldUseBodyScroll}
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
          )}
        </div>
      </div>
      <ConfirmationModal />
    </>
  );
};

export default CollectionDetail;
