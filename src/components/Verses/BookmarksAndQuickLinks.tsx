import { useState } from 'react';

import QuickLinks from '../HomePage/QuickLinks';

import BookmarkedVersesList from './BookmarkedVersesList';
import styles from './BookmarksAndQuickLinks.module.scss';

import Tabs from 'src/components/dls/Tabs/Tabs';

enum View {
  Bookmarks = 'bookmarks',
  Popular = 'popular',
}

const tabs = [
  { title: 'Popular', value: View.Popular },
  { title: 'Bookmarks', value: View.Bookmarks },
];

const BookmarksAndQuickLinks = () => {
  const [view, setView] = useState(View.Popular);

  return (
    <div>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={(newView) => setView(newView as View)} />
      </div>
      <div>
        {view === View.Bookmarks && <BookmarkedVersesList />}
        {view === View.Popular && <QuickLinks />}
      </div>
    </div>
  );
};

export default BookmarksAndQuickLinks;
