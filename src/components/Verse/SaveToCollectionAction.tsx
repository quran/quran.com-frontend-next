/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import SaveToCollectionModal, {
  Collection,
} from '../Collection/SaveToCollectionModal/SaveToCollectionModal';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import PlusIcon from '@/icons/plus.svg';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import {
  addCollection,
  addCollectionBookmark,
  deleteCollectionBookmarkByKey,
  getBookmarkCollections,
  getCollectionsList,
} from 'src/utils/auth/api';
import {
  makeBookmarkCollectionsUrl,
  makeBookmarksUrl,
  makeCollectionsUrl,
  makeBookmarkUrl,
} from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { logButtonClick } from 'src/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

const SaveToCollectionAction = ({ verse, bookmarksRangeUrl, isTranslationView }) => {
  const [isSaveCollectionModalOpen, setIsSaveCollectionModalOpen] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation();
  const { data: collectionListData, mutate: mutateCollectionListData } = useSWR(
    isLoggedIn() ? makeCollectionsUrl({}) : null,
    () => getCollectionsList({}),
  );

  const { mutate: globalSWRMutate } = useSWRConfig();

  const { data: bookmarkCollectionIdsData, mutate: mutateBookmarkCollectionIdsData } =
    useSWRImmutable(
      isLoggedIn()
        ? makeBookmarkCollectionsUrl(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            Number(verse.verseNumber),
          )
        : null,
      async () => {
        const response = await getBookmarkCollections(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        );
        return response;
      },
    );

  const toast = useToast();

  const onMenuClicked = () => {
    setIsSaveCollectionModalOpen(true);
    if (isTranslationView) {
      logButtonClick('save_to_collection_menu_trans_view');
    } else {
      logButtonClick('save_to_collection_menu_reading_view');
    }
  };

  const closeModal = () => {
    setIsSaveCollectionModalOpen(false);
  };

  const mutateIsResourceBookmarked = () => {
    if (!isLoggedIn()) {
      return;
    }
    globalSWRMutate(
      makeBookmarkUrl(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      ),
    );

    if (bookmarksRangeUrl) {
      globalSWRMutate(bookmarksRangeUrl);
    }
  };

  const mutateBookmarksUrl = () =>
    globalSWRMutate(
      makeBookmarksUrl(
        getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
      ),
    );

  const onCollectionToggled = (changedCollection: Collection, newValue: boolean) => {
    if (newValue === true) {
      addCollectionBookmark({
        key: Number(verse.chapterId),
        mushaf: mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        collectionId: changedCollection.id,
      })
        .then(() => {
          toast(t('quran-reader:saved-to', { collectionName: changedCollection.name }), {
            status: ToastStatus.Success,
          });
          mutateIsResourceBookmarked();
          mutateCollectionListData();
          mutateBookmarkCollectionIdsData();
          mutateBookmarksUrl();
        })
        .catch((err) => {
          if (err.status === 400) {
            toast(t('common:error.bookmark-sync'), {
              status: ToastStatus.Error,
            });
            return;
          }
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
    } else {
      deleteCollectionBookmarkByKey({
        key: Number(verse.chapterId),
        mushaf: mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        collectionId: changedCollection.id,
      })
        .then(() => {
          toast(t('quran-reader:removed-from', { collectionName: changedCollection.name }), {
            status: ToastStatus.Success,
          });
          mutateIsResourceBookmarked();
          mutateCollectionListData();
          mutateBookmarkCollectionIdsData();
          mutateBookmarksUrl();
        })
        .catch((err) => {
          if (err.status === 400) {
            toast(t('common:error.bookmark-sync'), {
              status: ToastStatus.Error,
            });
            return;
          }
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
    }
  };

  const onNewCollectionCreated = (newCollectionName: string) => {
    return addCollection(newCollectionName).then((newCollection: any) => {
      addCollectionBookmark({
        collectionId: newCollection.id,
        key: Number(verse.chapterId),
        mushaf: mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
      })
        .then(() => {
          mutateIsResourceBookmarked();
          mutateCollectionListData();
          mutateBookmarkCollectionIdsData([...bookmarkCollectionIdsData, newCollection.id]);
          mutateBookmarksUrl();
        })
        .catch((err) => {
          if (err.status === 400) {
            toast(t('common:error.bookmark-sync'), {
              status: ToastStatus.Error,
            });
            return;
          }
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
    });
  };

  const isDataReady = bookmarkCollectionIdsData && collectionListData;

  const collections = !isDataReady
    ? []
    : (collectionListData.data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        checked: bookmarkCollectionIdsData?.includes(collection.id),
      })) as Collection[]);

  return (
    <>
      <PopoverMenu.Item onClick={onMenuClicked} icon={<PlusIcon />}>
        {t('common:save-to-collection')}
      </PopoverMenu.Item>
      {isDataReady && (
        <SaveToCollectionModal
          isOpen={isSaveCollectionModalOpen}
          onCollectionToggled={onCollectionToggled}
          onNewCollectionCreated={onNewCollectionCreated}
          onClose={closeModal}
          collections={collections}
          verseKey={`${verse.chapterId}:${verse.verseNumber}`}
        />
      )}
    </>
  );
};

export default SaveToCollectionAction;
