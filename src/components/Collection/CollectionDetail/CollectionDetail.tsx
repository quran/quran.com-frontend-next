import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import CollectionSorter from '../CollectionSorter/CollectionSorter';

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
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
};

const CollectionDetail = ({
  title,
  collectionItems,
  sortBy,
  onSortByChange,
}: CollectionDetailProps) => {
  const { t, lang } = useTranslation();

  const sortOptions = [
    {
      id: 'recentlyAdded',
      label: t('collection:recently-added'),
    },
    {
      id: 'verseKey',
      label: t('collection:verse-key'),
    },
  ];

  const chaptersData = useContext(DataContext);
  const sorter = (
    <CollectionSorter selectedOptionId={sortBy} onChange={onSortByChange} options={sortOptions} />
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
