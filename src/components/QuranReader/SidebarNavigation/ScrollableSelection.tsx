import { useEffect, useState } from 'react';

import classNames from 'classnames';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useScrollTo from 'src/hooks/useScrollTo';
import { logEmptySearchResults } from 'src/utils/eventLogger';

const ScrollableSelection = ({
  items,
  searchPlaceholder,
  renderItem,
  getHref,
  isJuz = true,
  selectedItem,
}) => {
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

  const selectedItemRef = useScrollTo((node) => node.parentNode.parentNode);

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
          <Link href={getHref(item.value)} key={item.value}>
            <div
              ref={item.value === selectedItem ? selectedItemRef : null}
              className={classNames(
                styles.listItem,
                item.value === selectedItem && styles.selectedItem,
              )}
            >
              {renderItem(item)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ScrollableSelection;
