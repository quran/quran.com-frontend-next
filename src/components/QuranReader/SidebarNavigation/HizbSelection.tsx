import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getHizbIds } from '@/utils/hizb';
import { getHizbNavigationUrl } from '@/utils/navigation';

const HizbSelection = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const hizbIds = getHizbIds(locale);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);

  return (
    <ScrollableSelection
      items={hizbIds}
      getHref={getHizbNavigationUrl}
      searchPlaceholder={t('sidebar.search-hizb')}
      renderItem={(hizb) => `${t('hizb')} ${hizb.label}`}
      selectedItem={Number(lastReadVerseKey.hizb)}
    />
  );
};
export default HizbSelection;
