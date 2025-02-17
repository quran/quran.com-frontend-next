import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectedLastReadPage } from '@/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getPageNavigationUrl } from '@/utils/navigation';
import { getPageIdsByMushaf } from '@/utils/page';

type Props = {
  onAfterNavigationItemRouted?: () => void;
};

const PageSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  const { t, lang } = useTranslation('common');
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles);
  const pageIds = getPageIdsByMushaf(lang, quranFont, mushafLines);
  const lastReadPage = useSelector(selectedLastReadPage);

  return (
    <ScrollableSelection
      items={pageIds}
      getHref={getPageNavigationUrl}
      searchPlaceholder={t('sidebar.search-page')}
      renderItem={(page) => `${t('page')} ${page.label}`}
      isJuz={false}
      selectedItem={Number(lastReadPage)}
      onAfterNavigationItemRouted={onAfterNavigationItemRouted}
    />
  );
};

export default PageSelection;
