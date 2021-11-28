import useTranslation from 'next-translate/useTranslation';

import BookmarkedVersesList from './BookmarkedVersesList';
import styles from './BookmarksAndQuickLinks.module.scss';

import Tabs from 'src/components/dls/Tabs/Tabs';

enum View {
  Bookmarks = 'bookmarks',
  Popular = 'popular',
}

const BookmarksSection = () => {
  const { t } = useTranslation('home');

  const tabs = [{ title: t('tab.bookmarks'), value: View.Bookmarks }];

  return (
    <div>
      <div className={styles.tabsContainer}>
        <Tabs
          tabs={tabs}
          selected={View.Bookmarks}
          onSelect={() => {
            // do nothing, we're only using the UI of the Tab for now, and not using the functionality
            // TODO: design a more proper UI for this section, and remove Tabs usage here
          }}
        />
      </div>
      <div className={styles.contentContainer}>
        <BookmarkedVersesList />
      </div>
    </div>
  );
};

export default BookmarksSection;
