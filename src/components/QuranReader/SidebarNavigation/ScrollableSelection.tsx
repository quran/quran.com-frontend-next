import { useEffect, useState } from 'react';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import { logEmptySearchResults } from 'src/utils/eventLogger';

const ScrollableSelection = ({ items, searchPlaceholder, renderItem, getHref, isJuz = true }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(
    (item) =>
      item.value.toString().startsWith(searchQuery) ||
      item.label.toString().startsWith(searchQuery),
  );

  useEffect(() => {
    if (!filteredItems.length) {
      // eslint-disable-next-line i18next/no-literal-string
      logEmptySearchResults(searchQuery, `sidebar_navigation_${isJuz ? 'juz' : 'page'}_list`);
    }
  }, [searchQuery, filteredItems, isJuz]);

  return (
    <div>
      <input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={searchPlaceholder}
      />
      <div className={styles.list}>
        {filteredItems.map((item) => (
          <Link href={getHref(item.value)} key={item.value} prefetch={false}>
            <div className={styles.listItem}>{renderItem(item)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ScrollableSelection;
