import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import { getPageNavigationUrl } from 'src/utils/navigation';
import { getPageIds } from 'src/utils/page';

const PageSelection = () => {
  const pageIds = getPageIds();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation('common');
  return (
    <div>
      <input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('sidebar.search-page')}
      />
      <div className={styles.list}>
        {pageIds.map((pageId) =>
          pageId.toString().startsWith(searchQuery) ? (
            <Link href={getPageNavigationUrl(pageId)}>
              <div className={styles.listItem}>
                {t('page')} {pageId}
              </div>
            </Link>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default PageSelection;
