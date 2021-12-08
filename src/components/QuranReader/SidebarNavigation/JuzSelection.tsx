import useTranslation from 'next-translate/useTranslation';

import ScrollableSelection from './ScrollableSelection';

import { getJuzIds } from 'src/utils/juz';

const JuzSelection = () => {
  const juzIds = getJuzIds();
  const { t } = useTranslation('common');

  return (
    <ScrollableSelection
      items={juzIds}
      searchPlaceholder={t('sidebar.search-juz')}
      renderItem={(juzId) => `${t('juz')} ${juzId}`}
    />
  );
};
export default JuzSelection;
