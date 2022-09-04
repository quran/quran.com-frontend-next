import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionList.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import BookmarkIcon from '@/icons/unbookmarked.svg';

type Collection = {
  id: string | number;
  name: string;
  itemCount: number;
};

type CollectionListProps = {
  collections: Collection[];
};

const CollectionList = ({ collections }: CollectionListProps) => {
  const { t } = useTranslation();
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
            <div key={collection.id} className={styles.itemContainer}>
              <div>
                <div className={styles.itemTitle}>{collection.name}</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemIcon}>
                    <BookmarkIcon />
                  </div>
                  <div className={styles.itemCount}>
                    {collection.itemCount} {t('common:verses')}
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
          );
        })}
      </div>
    </div>
  );
};

export default CollectionList;
