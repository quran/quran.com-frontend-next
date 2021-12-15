import { useState } from 'react';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';

const ScrollableSelection = ({ items, searchPlaceholder, renderItem, getHref }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={searchPlaceholder}
      />
      <div className={styles.list}>
        {items
          .filter(
            (item) =>
              item.value.toString().startsWith(searchQuery) ||
              item.label.toString().startsWith(searchQuery),
          )
          .map((item) => (
            <Link href={getHref(item.value)} key={item.value}>
              <div className={styles.listItem}>{renderItem(item)}</div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ScrollableSelection;
