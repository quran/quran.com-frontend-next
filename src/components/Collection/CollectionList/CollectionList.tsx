/* eslint-disable max-lines */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import useSWR from 'swr';

import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import BookmarkIcon from '../../../../public/icons/unbookmarked.svg';
import CollectionSorter from '../CollectionSorter/CollectionSorter';
import RenameCollectionModal from '../RenameCollectionModal/RenameCollectionModal';

import styles from './CollectionList.module.scss';
import DeleteCollectionAction from './DeleteCollectionAction';
import RenameCollectionAction from './RenameCollectionAction';

import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { getCollectionsList, updateCollection } from 'src/utils/auth/api';
import { makeCollectionsUrl } from 'src/utils/auth/apiPaths';
import { Collection } from 'types/Collection';
import { CollectionListSortOption } from 'types/CollectionSortOptions';

const DEFAULT_SORT_OPTION = CollectionListSortOption.RecentlyUpdated;

const CollectionList = () => {
  const [collectionToRename, setCollectionToRename] = useState<Collection | null>(null);
  const { t, lang } = useTranslation();
  const toast = useToast();
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_OPTION);
  const apiParams = {
    sortBy,
  };

  const { data, mutate } = useSWR<any>(makeCollectionsUrl(apiParams), () =>
    getCollectionsList(apiParams),
  );

  const sortOptions = [
    { id: CollectionListSortOption.RecentlyUpdated, label: t('collection:recently-updated') },
    { id: CollectionListSortOption.Alphabetical, label: t('collection:alphabetical') },
  ];

  if (!data) return null;

  const collections = data?.data || [];

  const onSortOptionChanged = (nextSortBy) => {
    logValueChange('collection_list', sortBy, nextSortBy);
    setSortBy(nextSortBy);
  };

  const onCollectionUpdated = () => {
    mutate();
  };

  const closeModal = () => {
    logButtonClick('rename_collection_action_close');
    setCollectionToRename(null);
  };

  const onSubmit = (renameFormData: any) => {
    logButtonClick('rename_collection_action_submit');
    updateCollection(collectionToRename.id, { name: renameFormData.name })
      .then(() => {
        onCollectionUpdated();
        setCollectionToRename(null);
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  const isRenameModalOpen = !!collectionToRename;

  return (
    <>
      <RenameCollectionModal
        onClose={closeModal}
        isOpen={isRenameModalOpen}
        defaultValue={collectionToRename?.name}
        onSubmit={onSubmit}
      />
      <ConfirmationModal />
      <div>
        <div className={styles.header}>
          <div>{t('collection:collections')}</div>
          <CollectionSorter
            options={sortOptions}
            selectedOptionId={sortBy}
            onChange={onSortOptionChanged}
          />
        </div>
        <div className={styles.collectionListContainer}>
          <div>
            <div className={styles.itemContainer}>
              <Link href="/collections/all">
                <div>
                  <div className={styles.itemTitle}>{t('collection:all-saved-verses')}</div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemIcon}>
                      <BookmarkIcon />
                    </div>
                    <div className={styles.itemCount}>
                      {data?.collectionsItemsCount && (
                        <>{toLocalizedNumber(data?.collectionsItemsCount, lang)}</>
                      )}{' '}
                      {t('common:verses')}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          {collections.map((collection) => {
            return (
              <div key={collection.id}>
                <div className={styles.itemContainer}>
                  <Link href={`/collections/${collection.id}`}>
                    <div>
                      <div className={styles.itemTitle}>{collection.name}</div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemIcon}>
                          <BookmarkIcon />
                        </div>
                        <div className={styles.itemCount}>
                          {toLocalizedNumber(collection.count, lang)} {t('common:verses')}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <PopoverMenu
                    trigger={
                      <Button
                        size={ButtonSize.Small}
                        tooltip={t('common:more')}
                        variant={ButtonVariant.Ghost}
                        shape={ButtonShape.Circle}
                        ariaLabel={t('common:more')}
                      >
                        <span>
                          <OverflowMenuIcon />
                        </span>
                      </Button>
                    }
                    isModal
                    isPortalled
                  >
                    <RenameCollectionAction onClick={() => setCollectionToRename(collection)} />
                    <DeleteCollectionAction
                      collectionName={collection.name}
                      collectionId={collection.id}
                      onDone={onCollectionUpdated}
                    />
                  </PopoverMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CollectionList;
