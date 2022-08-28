/* eslint-disable i18next/no-literal-string */
import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';

import styles from './CollectionDetail.module.scss';

import Collapsible from 'src/components/dls/Collapsible/Collapsible';

type CollectionItem = {
  title: string;
  content: string;
};

type CollectionDetailProps = {
  title: string;
  collectionItems: CollectionItem[];
};

const CollectionDetail = ({ title, collectionItems }: CollectionDetailProps) => {
  const sorter = (
    <div className={styles.sorter}>
      Recently added
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
              key={item.title}
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
