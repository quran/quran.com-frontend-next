import { useState, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CollectionList from '../Collection/CollectionList/CollectionList';

// TODO: Uncomment when backend task for page bookmarks is done (QF-1720)
// import BookmarkedPagesList from './BookmarkedPagesList';
import BookmarkedVersesList from './BookmarkedVersesList';
import styles from './BookmarksAndQuickLinks.module.scss';
import RecentReadingSessionsList from './RecentReadingSessionsList';

import Tabs from '@/dls/Tabs/Tabs';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { logValueChange } from '@/utils/eventLogger';

enum View {
  ReadingSessions = 'reading_sessions',
  Bookmarks = 'bookmarks',
  // TODO: Uncomment when backend task for page bookmarks is done (QF-1720)
  // PageBookmarks = 'page_bookmarks',
  Collections = 'collections',
}

type Props = {
  isHomepage?: boolean;
};

const BookmarksAndCollectionsSection: React.FC<Props> = ({ isHomepage = false }) => {
  const { t } = useTranslation('home');
  const { isLoggedIn } = useIsLoggedIn();
  const [selectedTab, setSelectedTab] = useState(
    isHomepage ? View.ReadingSessions : View.Bookmarks,
  );

  const tabs = useMemo(() => {
    const tabsList = [];

    if (isHomepage) {
      tabsList.push({ title: t('recently-read'), value: View.ReadingSessions });
    }
    tabsList.push({ title: t('tab.bookmarks'), value: View.Bookmarks });
    // TODO: Uncomment when backend task for page bookmarks is done (QF-1720)
    // tabsList.push({ title: t('tab.page-bookmarks'), value: View.PageBookmarks });

    if (isLoggedIn) {
      tabsList.push({ title: t('collection:collections'), value: View.Collections });
    }

    return tabsList;
  }, [isHomepage, isLoggedIn, t]);

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
        {selectedTab === View.ReadingSessions && <RecentReadingSessionsList />}
        {selectedTab === View.Bookmarks && <BookmarkedVersesList />}
        {/* TODO: Uncomment when backend task for page bookmarks is done (QF-1720) */}
        {/* {selectedTab === View.PageBookmarks && <BookmarkedPagesList />} */}
        {selectedTab === View.Collections && <CollectionList />}
      </div>
    </div>
  );
};

export default BookmarksAndCollectionsSection;
