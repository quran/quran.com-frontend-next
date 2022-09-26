import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CollectionList from '../Collection/CollectionList/CollectionList';

import BookmarkedVersesList from './BookmarkedVersesList';
import styles from './BookmarksAndQuickLinks.module.scss';

import Tabs from '@/dls/Tabs/Tabs';
import { isLoggedIn } from '@/utils/auth/login';
import { logValueChange } from '@/utils/eventLogger';

enum View {
  Bookmarks = 'bookmarks',
  Collections = 'collections',
}

const BookmarksAndCollectionsSection = () => {
  const { t } = useTranslation('home');
  const [selectedTab, setSelectedTab] = useState(View.Bookmarks);

  const tabs = [{ title: t('tab.bookmarks'), value: View.Bookmarks }];
  if (isLoggedIn()) {
    tabs.push({ title: t('collection:collections'), value: View.Collections });
  }

  const onTabSelected = (newTab) => {
    logValueChange('bookmark_section_and_collection', selectedTab, newTab);
    setSelectedTab(newTab);
  };

  return (
    <div>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={onTabSelected} />
      </div>
      <div className={classNames(styles.contentContainer, styles.tabsContainer)}>
        {selectedTab === View.Bookmarks && <BookmarkedVersesList />}
        {selectedTab === View.Collections && <CollectionList />}
      </div>
    </div>
  );
};

export default BookmarksAndCollectionsSection;
