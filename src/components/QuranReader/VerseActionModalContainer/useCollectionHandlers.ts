import { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { CollectionOption } from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useBookmarkCollections from '@/hooks/useBookmarkCollections';
import useCollections from '@/hooks/useCollections';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import BookmarkType from 'types/BookmarkType';

interface UseCollectionHandlersParams {
  chapterId: number;
  verseNumber: number;
  bookmarksRangeUrl: string;
}

const useCollectionHandlers = ({
  chapterId,
  verseNumber,
  bookmarksRangeUrl,
}: UseCollectionHandlersParams) => {
  const { t } = useTranslation();
  const toast = useToast();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const { collections, addCollection } = useCollections({ type: BookmarkType.Ayah });
  const { collectionIds, addToCollection, removeFromCollection } = useBookmarkCollections({
    mushafId,
    key: chapterId,
    type: BookmarkType.Ayah,
    verseNumber,
    bookmarksRangeUrl,
  });

  const onCollectionToggled = useCallback(
    async (changedCollection: CollectionOption, newValue: boolean) => {
      const success = newValue
        ? await addToCollection(changedCollection.id)
        : await removeFromCollection(changedCollection.id);
      if (success) {
        const key = newValue ? 'quran-reader:saved-to' : 'quran-reader:removed-from';
        toast(t(key, { collectionName: changedCollection.name }), { status: ToastStatus.Success });
      }
    },
    [addToCollection, removeFromCollection, toast, t],
  );

  const onNewCollectionCreated = useCallback(
    async (newCollectionName: string) => {
      const newCollection = await addCollection(newCollectionName);
      if (newCollection) {
        await addToCollection(newCollection.id);
      }
    },
    [addCollection, addToCollection],
  );

  const modalCollections: CollectionOption[] = useMemo(
    () =>
      collections.map((c) => ({
        id: c.id,
        name: c.name,
        checked: collectionIds?.includes(c.id) ?? false,
      })),
    [collections, collectionIds],
  );

  return { modalCollections, onCollectionToggled, onNewCollectionCreated };
};

export default useCollectionHandlers;
