import useTranslation from 'next-translate/useTranslation';

import ScrollableSelection from './ScrollableSelection';

import { getPageNavigationUrl } from 'src/utils/navigation';
import { getPageIdsByMushaf } from 'src/utils/page';

const PageSelection = () => {
  const { t, lang } = useTranslation('common');
  const pageIds = getPageIdsByMushaf(lang);

  return (
    <ScrollableSelection
      items={pageIds}
      getHref={getPageNavigationUrl}
      searchPlaceholder={t('sidebar.search-page')}
      renderItem={(page) => `${t('page')} ${page.label}`}
    />
  );
};

export default PageSelection;
