import useTranslation from 'next-translate/useTranslation';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';

import styles from './CollectionDetail.module.scss';

import Collapsible from 'src/components/dls/Collapsible/Collapsible';

type CollectionItem = {
  id: string | number;
  title: string;
  content: string;
};

type CollectionDetailProps = {
  title: string;
  collectionItems: CollectionItem[];
};

const CollectionDetail = ({ title, collectionItems }: CollectionDetailProps) => {
  const { t } = useTranslation();
  const sorter = (
    <div className={styles.sorter}>
      {t('collection:recently-added')}
      <div className={styles.sorterIcon}>
        <ChevronDownIcon />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {sorter}
      </div>
      <div className={styles.collectionItemsContainer}>
        {collectionItems.map((item) => {
          return (
            <Collapsible
              title={item.title}
              key={item.id}
              prefix={<ChevronDownIcon />}
              suffix={<OverflowMenuIcon />}
            >
              {({ isOpen }) => {
                if (!isOpen) return null;
                return <div className={styles.item}>{item.content}</div>;
              }}
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionDetail;
