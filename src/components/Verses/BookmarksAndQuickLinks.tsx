import { useState } from 'react';

import QuickLinks from '../HomePage/QuickLinks';

import BookmarkedVersesList from './BookmarkedVersesList';
import styles from './BookmarksAndQuickLinks.module.scss';

import Tabs from 'src/components/dls/Tabs/Tabs';

const tabs = [
  { title: 'Popular', value: 'popular' },
  { title: 'Bookmarks', value: 'bookmarks' },
];

const BookmarksAndQuickLinks = () => {
  const [view, setView] = useState('popular');

  return (
    <div>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={setView} />
      </div>
      <div>
        {view === 'bookmarks' && <BookmarkedVersesList />}
        {view === 'popular' && <QuickLinks />}
      </div>
    </div>
  );
};

export default BookmarksAndQuickLinks;
