import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectLastReadHizb } from 'src/redux/slices/QuranReader/readingTracker';
import { getJuzIds, getJuzNumberByHizb } from 'src/utils/juz';
import { getJuzNavigationUrl } from 'src/utils/navigation';

const JuzSelection = () => {
  const { t, lang } = useTranslation('common');
  const juzIds = getJuzIds(lang);
  const lastReadHizb = useSelector(selectLastReadHizb);
  const selectedJuz = useMemo(() => getJuzNumberByHizb(Number(lastReadHizb)), [lastReadHizb]);

  return (
    <ScrollableSelection
      items={juzIds}
      getHref={getJuzNavigationUrl}
      searchPlaceholder={t('sidebar.search-juz')}
      renderItem={(juz) => `${t('juz')} ${juz.label}`}
      selectedItem={selectedJuz}
    />
  );
};
export default JuzSelection;
