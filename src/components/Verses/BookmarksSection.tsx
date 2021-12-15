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
        <Tabs tabs={tabs} selected={View.Bookmarks} />
      </div>
      <div className={styles.contentContainer}>
        <BookmarkedVersesList />
      </div>
    </div>
  );
};

export default BookmarksSection;
