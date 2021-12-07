import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import { getJuzIds } from 'src/utils/juz';
import { getJuzNavigationUrl } from 'src/utils/navigation';

const JuzSelection = () => {
  const juzIds = getJuzIds();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation('common');
  return (
    <div>
      <input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('sidebar.search-juz')}
      />
      <div>
        {juzIds.map((juzId) =>
          juzId.toString().startsWith(searchQuery) ? (
            <Link href={getJuzNavigationUrl(juzId)}>
              <div className={styles.listItem}>
                {t('juz')} {juzId}
              </div>
            </Link>
          ) : null,
        )}
      </div>
    </div>
  );
};
export default JuzSelection;
