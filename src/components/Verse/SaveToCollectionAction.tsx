import { useState, useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import SaveToCollectionModal, {
  CollectionOption,
} from '../Collection/SaveToCollectionModal/SaveToCollectionModal';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useBookmarkCollections from '@/hooks/useBookmarkCollections';
import useCollections from '@/hooks/useCollections';
import PlusIcon from '@/icons/plus.svg';
import { WordVerse } from '@/types/Word';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { logButtonClick } from 'src/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

interface Props {
  verse: WordVerse;
  isTranslationView: boolean;
  bookmarksRangeUrl?: string;
}

/**
 * Action component for saving verses to collections
 * Uses extracted hooks for cleaner separation of concerns
 *
 * @returns {JSX.Element} The save to collection action component
 */
const SaveToCollectionAction: React.FC<Props> = ({
  verse,
  isTranslationView,
  bookmarksRangeUrl,
}) => {
  const [isSaveCollectionModalOpen, setIsSaveCollectionModalOpen] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation();
  const toast = useToast();

  // Use extracted hooks for data fetching and mutations
  const { collections, addCollection } = useCollections({
    type: BookmarkType.Ayah,
  });

  const {
    collectionIds: bookmarkCollectionIds,
    addToCollection,
    removeFromCollection,
  } = useBookmarkCollections({
    mushafId,
    key: Number(verse.chapterId),
    type: BookmarkType.Ayah,
    verseNumber: verse.verseNumber,
    bookmarksRangeUrl,
  });

  const onMenuClicked = useCallback(() => {
    setIsSaveCollectionModalOpen(true);
    if (isTranslationView) {
      logButtonClick('save_to_collection_menu_trans_view');
    } else {
      logButtonClick('save_to_collection_menu_reading_view');
    }
  }, [isTranslationView]);

  const closeModal = useCallback(() => {
    setIsSaveCollectionModalOpen(false);
  }, []);

  const onCollectionToggled = useCallback(
    async (changedCollection: CollectionOption, newValue: boolean) => {
      if (newValue) {
        const success = await addToCollection(changedCollection.id);
        if (success) {
          toast(t('quran-reader:saved-to', { collectionName: changedCollection.name }), {
            status: ToastStatus.Success,
          });
        }
      } else {
        const success = await removeFromCollection(changedCollection.id);
        if (success) {
          toast(t('quran-reader:removed-from', { collectionName: changedCollection.name }), {
            status: ToastStatus.Success,
          });
        }
      }
    },
    [addToCollection, removeFromCollection, toast, t],
  );

  const onNewCollectionCreated = useCallback(
    async (newCollectionName: string) => {
      const newCollection = await addCollection(newCollectionName);
      if (newCollection) {
        // addToCollection handles both the API call and cache mutation internally
        await addToCollection(newCollection.id);
      }
    },
    [addCollection, addToCollection],
  );

  const isDataReady = bookmarkCollectionIds !== undefined;

  const modalCollections: CollectionOption[] = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        checked: bookmarkCollectionIds?.includes(collection.id) ?? false,
      })),
    [collections, bookmarkCollectionIds],
  );

  return (
    <>
      <PopoverMenu.Item
        onClick={onMenuClicked}
        icon={
          <IconContainer icon={<PlusIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
        }
      >
        {t('common:save-to-collection')}
      </PopoverMenu.Item>
      {isDataReady && (
        <SaveToCollectionModal
          isOpen={isSaveCollectionModalOpen}
          onCollectionToggled={onCollectionToggled}
          onNewCollectionCreated={onNewCollectionCreated}
          onClose={closeModal}
          collections={modalCollections}
          verseKey={`${verse.chapterId}:${verse.verseNumber}`}
        />
      )}
    </>
  );
};

export default SaveToCollectionAction;
