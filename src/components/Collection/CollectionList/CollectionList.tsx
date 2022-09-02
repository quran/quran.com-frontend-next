import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import useSWR from 'swr';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import BookmarkIcon from '../../../../public/icons/unbookmarked.svg';

import styles from './CollectionList.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { getCollectionsList } from 'src/utils/auth/api';
import { makeCollectionsUrl } from 'src/utils/auth/apiPaths';

const CollectionList = () => {
  const { t } = useTranslation();
  const { data } = useSWR(makeCollectionsUrl, getCollectionsList);

  if (!data) return null;

  const collections = data?.data || [];

  const sorter = (
    <div className={styles.sorter}>
      {t('profile:recently-added')}
      <span className={styles.itemIcon}>
        <ChevronDownIcon />
      </span>
    </div>
  );
  return (
    <div>
      <div className={styles.header}>
        <div>{t('profile:collections')}</div>
        {sorter}
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
                  <PopoverMenu.Item>{t('profile:rename')}</PopoverMenu.Item>
                  <PopoverMenu.Item>{t('profile:delete')}</PopoverMenu.Item>
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
