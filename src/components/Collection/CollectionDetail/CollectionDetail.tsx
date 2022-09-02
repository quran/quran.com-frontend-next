import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';

import styles from './CollectionDetail.module.scss';

import Collapsible from 'src/components/dls/Collapsible/Collapsible';
import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { makeVerseKey } from 'src/utils/verse';

type CollectionItem = {
  createdAt: string;
  group: string;
  id: string;
  key: number;
  type: string;
  verseNumber: number;
};

type CollectionDetailProps = {
  title: string;
  collectionItems: CollectionItem[];
};

const CollectionDetail = ({ title, collectionItems }: CollectionDetailProps) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
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
          const chapterData = getChapterData(chaptersData, item.key.toString());
          const verseKey = makeVerseKey(item.key, item.verseNumber);
          const itemTitle = `${chapterData.transliteratedName} ${toLocalizedVerseKey(
            verseKey,
            lang,
          )}`;
          return (
            <Collapsible
              title={itemTitle}
              key={item.id}
              prefix={<ChevronDownIcon />}
              suffix={<OverflowMenuIcon />}
            >
              {({ isOpen }) => {
                if (!isOpen) return null;
                return <div className={styles.item}>aaaaaaa</div>;
              }}
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionDetail;
