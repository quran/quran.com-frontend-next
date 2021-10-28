import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import QuickLinks from '../HomePage/QuickLinks';

import BookmarkedVersesList from './BookmarkedVersesList';
import styles from './BookmarksAndQuickLinks.module.scss';

import Tabs from 'src/components/dls/Tabs/Tabs';

enum View {
  Bookmarks = 'bookmarks',
  Popular = 'popular',
}

const BookmarksAndQuickLinks = () => {
  const { t } = useTranslation('home');
  const [view, setView] = useState(View.Popular);

  const tabs = [
    { title: t('tab.popular'), value: View.Popular },
    { title: t('tab.bookmarks'), value: View.Bookmarks },
  ];

  return (
    <div>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={(newView) => setView(newView as View)} />
      </div>
      <div className={styles.contentContainer}>
        {view === View.Bookmarks && <BookmarkedVersesList />}
        {view === View.Popular && <QuickLinks />}
      </div>
    </div>
  );
};

export default BookmarksAndQuickLinks;
