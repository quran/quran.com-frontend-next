import React, { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './LoadFromCollectionModal.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CollectionIcon from '@/icons/collection.svg';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { privateFetcher } from '@/utils/auth/api';
import { makeCollectionsUrl, makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { makeVerseKey } from '@/utils/verse';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import BookmarkType from 'types/BookmarkType';
import { Collection } from 'types/Collection';

interface LoadFromCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LoadFromCollectionModal - Allows users to load verses from a collection to pinned verses
 * Shows a list of collections with checkboxes for single selection
 * @returns {JSX.Element} The load from collection modal component
 */
const LoadFromCollectionModal: React.FC<LoadFromCollectionModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const toast = useToast();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch collections list
  const { data: collectionsData, isValidating: isLoadingCollections } = useSWRImmutable<{
    data: Collection[];
  }>(isOpen ? makeCollectionsUrl({ type: BookmarkType.Ayah }) : null, privateFetcher);

  const collections = collectionsData?.data || [];

  // Sort collections: favourites first, then by recently updated
  const sortedCollections = [...collections].sort((a, b) => {
    // Favourites first (if there's a favourite field)
    // Then sort by updatedAt descending
    const aTime = new Date(a.updatedAt || 0).getTime();
    const bTime = new Date(b.updatedAt || 0).getTime();
    return bTime - aTime;
  });

  const handleCollectionSelect = useCallback((collectionId: string) => {
    setSelectedCollectionId((prev) => (prev === collectionId ? null : collectionId));
    logEvent('load_from_collection_select', { collectionId });
  }, []);

  const handleLoad = useCallback(async () => {
    if (!selectedCollectionId) return;

    logButtonClick('load_from_collection_confirm');
    setIsLoading(true);

    try {
      // Fetch collection details with bookmarks - use high limit to get all items
      const collectionData = await privateFetcher<GetBookmarkCollectionsIdResponse>(
        makeGetBookmarkByCollectionId(selectedCollectionId, {
          type: BookmarkType.Ayah,
          limit: 1000,
        }),
      );

      const bookmarks = collectionData?.data?.bookmarks || [];

      if (bookmarks.length === 0) {
        toast(t('collection:empty'), { status: ToastStatus.Warning });
        setIsLoading(false);
        return;
      }

      // Convert bookmarks to verse keys
      const verseKeys = bookmarks.map((bookmark) =>
        makeVerseKey(bookmark.key, bookmark.verseNumber),
      );

      // Dispatch action to pin all verses
      dispatch(pinVerses(verseKeys));

      toast(t('verses-loaded-successfully'), { status: ToastStatus.Success });
      onClose();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, onClose, selectedCollectionId, t, toast]);

  const handleCancel = useCallback(() => {
    logButtonClick('load_from_collection_cancel');
    setSelectedCollectionId(null);
    onClose();
  }, [onClose]);

  const renderContent = (): React.ReactNode => {
    if (isLoadingCollections) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      );
    }

    if (collections.length === 0) {
      return (
        <div className={styles.emptyState}>
          <CollectionIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{t('collection:no-collections')}</p>
        </div>
      );
    }

    return (
      <div className={styles.collectionList}>
        {sortedCollections.map((collection) => (
          <div
            className={styles.collectionItem}
            key={collection.id}
            onClick={() => handleCollectionSelect(collection.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCollectionSelect(collection.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Checkbox
              id={collection.id}
              checked={selectedCollectionId === collection.id}
              label={collection.name}
              onChange={() => handleCollectionSelect(collection.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <ContentModal
      isOpen={isOpen}
      header={<p className={styles.header}>{t('load-from-collection')}</p>}
      hasCloseButton
      onClose={handleCancel}
      onEscapeKeyDown={handleCancel}
      size={ContentModalSize.SMALL}
    >
      {renderContent()}

      <div className={styles.footer}>
        <Button variant={ButtonVariant.Ghost} onClick={handleCancel}>
          {t('common:cancel')}
        </Button>
        <Button
          onClick={handleLoad}
          isDisabled={!selectedCollectionId || isLoading}
          isLoading={isLoading}
        >
          {t('common:load')}
        </Button>
      </div>
    </ContentModal>
  );
};

export default LoadFromCollectionModal;
