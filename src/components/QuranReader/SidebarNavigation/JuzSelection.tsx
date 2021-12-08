import useTranslation from 'next-translate/useTranslation';

import ScrollableSelection from './ScrollableSelection';

import { getJuzIds } from 'src/utils/juz';
import { getJuzNavigationUrl } from 'src/utils/navigation';

const JuzSelection = () => {
  const { t, lang } = useTranslation('common');
  const juzIds = getJuzIds(lang);

  return (
    <ScrollableSelection
      items={juzIds}
      getHref={getJuzNavigationUrl}
      searchPlaceholder={t('sidebar.search-juz')}
      renderItem={(juzId) => `${t('juz')} ${juzId}`}
    />
  );
};
export default JuzSelection;
