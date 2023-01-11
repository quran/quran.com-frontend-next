import { useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getJuzIds, getJuzNumberByHizb } from '@/utils/juz';
import { getJuzNavigationUrl } from '@/utils/navigation';

const JuzSelection = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const juzIds = getJuzIds(locale);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const selectedJuz = useMemo(
    () => getJuzNumberByHizb(Number(lastReadVerseKey.hizb)),
    [lastReadVerseKey.hizb],
  );

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
