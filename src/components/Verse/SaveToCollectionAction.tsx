/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import SaveToCollectionModal, {
  Collection,
} from '../Collection/SaveToCollectionModal/SaveToCollectionModal';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import {
  addCollection,
  addOrRemoveBookmark,
  getBookmarkCollections,
  getCollectionsList,
} from 'src/utils/auth/api';
import { makeBookmarkCollectionsUrl, makeCollectionsUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import BookmarkType from 'types/BookmarkType';

const SaveToCollectionAction = ({ verse }) => {
  const [isSaveCollectionModalOpen, setIsSaveCollectionModalOpen] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation('common');
  const { data: collectionListData, mutate: mutateCollectionListData } = useSWR(
    makeCollectionsUrl,
    getCollectionsList,
  );

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
    // TODO: add logging here
  };

  const bookmarkIcon = 'a';

  const closeModal = () => {
    setIsSaveCollectionModalOpen(false);
  };

  const onCollectionToggled = (changedCollection: Collection, newValue: boolean) => {
    addOrRemoveBookmark({
      key: Number(verse.chapterId),
      mushafId,
      type: BookmarkType.Ayah,
      isAdd: newValue,
      verseNumber: verse.verseNumber,
      collectionId: changedCollection.id,
    }).catch((err) => {
      if (err.status === 400) {
        toast(t('common:error.bookmark-sync'), {
          status: ToastStatus.Error,
        });
        return;
      }
      toast(t('error.general'), {
        status: ToastStatus.Error,
      });
    });
  };

  const onNewCollectionCreated = (newCollectionName: string) => {
    return addCollection(newCollectionName).then((newCollection) => {
      mutateCollectionListData();
      mutateBookmarkCollectionIdsData([...bookmarkCollectionIdsData, newCollection.id]);
      addOrRemoveBookmark({
        key: Number(verse.chapterId),
        mushafId,
        type: BookmarkType.Ayah,
        isAdd: true,
        verseNumber: verse.verseNumber,
        collectionId: newCollection.id,
      }).catch((err) => {
        if (err.status === 400) {
          toast(t('common:error.bookmark-sync'), {
            status: ToastStatus.Error,
          });
          return;
        }
        toast(t('error.general'), {
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
      <PopoverMenu.Item onClick={onMenuClicked} icon={bookmarkIcon}>
        Save to Collection
        {/* {isVerseBookmarked ? `${t('bookmarked')}!` : `${t('bookmark')}`} */}
      </PopoverMenu.Item>
      {isDataReady && (
        <SaveToCollectionModal
          isOpen={isSaveCollectionModalOpen}
          onCollectionToggled={onCollectionToggled}
          onNewCollectionCreated={onNewCollectionCreated}
          onClose={closeModal}
          isAddingNewCollection
          collections={collections}
        />
      )}
    </>
  );
};

export default SaveToCollectionAction;
