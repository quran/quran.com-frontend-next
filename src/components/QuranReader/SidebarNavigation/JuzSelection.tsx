import useTranslation from 'next-translate/useTranslation';

import ScrollableSelection from './ScrollableSelection';

import { getJuzIds } from 'src/utils/juz';
import { toLocalizedNumber } from 'src/utils/locale';
import { getJuzNavigationUrl } from 'src/utils/navigation';

const JuzSelection = () => {
  const juzIds = getJuzIds();
  const { t, lang } = useTranslation('common');

  return (
    <ScrollableSelection
      items={juzIds}
      getHref={getJuzNavigationUrl}
      searchPlaceholder={t('sidebar.search-juz')}
      renderItem={(juzId) => `${t('juz')} ${toLocalizedNumber(juzId, lang)}`}
    />
  );
};
export default JuzSelection;
