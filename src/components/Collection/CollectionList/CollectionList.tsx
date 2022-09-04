import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import useSWR from 'swr';

import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import BookmarkIcon from '../../../../public/icons/unbookmarked.svg';
import CollectionSorter from '../CollectionSorter/CollectionSorter';

import styles from './CollectionList.module.scss';
import DeleteCollectionAction from './DeleteCollectionAction';
import RenameCollectionAction from './RenameCollectionAction';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { getCollectionsList } from 'src/utils/auth/api';
import { makeCollectionsUrl } from 'src/utils/auth/apiPaths';

const defaultSortOptionId = 'recentlyUpdated';

const CollectionList = () => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState(defaultSortOptionId);
  const { data, mutate } = useSWR(
    makeCollectionsUrl({
      sortBy,
    }),
    () =>
      getCollectionsList({
        sortBy,
      }),
  );

  const sortOptions = [
    { id: 'recentlyUpdated', label: t('collection:recently-updated') },
    { id: 'alphabetical', label: t('collection:alphabetical') },
  ];

  if (!data) return null;

  const collections = data?.data || [];

  const onSortOptionChanged = (val) => {
    setSortBy(val);
  };

  const onCollectionUpdated = () => {
    mutate();
  };

  return (
    <div>
      <div className={styles.header}>
        <div>{t('profile:collections')}</div>
        <CollectionSorter
          options={sortOptions}
          selectedOptionId={sortBy}
          onChange={onSortOptionChanged}
        />
      </div>
      <div className={styles.collectionListContainer}>
        {collections.map((collection) => {
          return (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <div className={styles.itemContainer}>
                <div>
                  <div className={styles.itemTitle}>{collection.name}</div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemIcon}>
                      <BookmarkIcon />
                    </div>
                    <div className={styles.itemCount}>
                      {collection.count} {t('common:verses')}
                    </div>
                  </div>
                </div>

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
                  <RenameCollectionAction
                    currentCollectionName={collection.name}
                    collectionId={collection.id}
                    onDone={onCollectionUpdated}
                  />
                  <DeleteCollectionAction
                    collectionId={collection.id}
                    onDone={onCollectionUpdated}
                  />
                </PopoverMenu>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionList;
