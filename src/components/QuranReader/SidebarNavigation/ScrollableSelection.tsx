import { useState } from 'react';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import { getPageNavigationUrl } from 'src/utils/navigation';

const ScrollableSelection = ({ items, searchPlaceholder, renderItem }) => {
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
          .filter((item) => item.toString().startsWith(searchQuery))
          .map((item) => (
            <Link href={getPageNavigationUrl(item)}>
              <div className={styles.listItem}>{renderItem(item)}</div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ScrollableSelection;
