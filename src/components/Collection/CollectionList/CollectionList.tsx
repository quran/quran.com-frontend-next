/* eslint-disable i18next/no-literal-string */
import useTranslation from 'next-translate/useTranslation';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import BookmarkIcon from '../../../../public/icons/unbookmarked.svg';

import styles from './CollectionList.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

type Collection = {
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
      Recently Added{' '}
      <span className={styles.itemIcon}>
        <ChevronDownIcon />
      </span>
    </div>
  );
  return (
    <div>
      <div className={styles.header}>
        <div>Collections</div>
        {sorter}
      </div>
      <div className={styles.collectionListContainer}>
        {collections.map((collection) => {
          return (
            <div key={collection.name} className={styles.itemContainer}>
              <div>
                <div className={styles.itemTitle}>{collection.name}</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemIcon}>
                    <BookmarkIcon />
                  </div>
                  <div className={styles.itemCount}>{collection.itemCount} verses</div>
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
                <PopoverMenu.Item>Rename</PopoverMenu.Item>
                <PopoverMenu.Item>Delete</PopoverMenu.Item>
              </PopoverMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionList;
