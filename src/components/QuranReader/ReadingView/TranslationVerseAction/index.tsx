import { useCallback, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

import TranslationsIcon from '../../../../../public/icons/collection.svg';

import styles from './TranslationVerseAction.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import ContentModalHandles from 'src/components/dls/ContentModal/types/ContentModalHandles';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import TranslationsView from 'src/components/QuranReader/ReadingView/TranslationsView';
import TranslationViewCellSkeleton from 'src/components/QuranReader/TranslationView/TranslatioViewCellSkeleton';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVersesUrl } from 'src/utils/apiPaths';
import { logButtonClick, logEvent } from 'src/utils/eventLogger';
import { VersesResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

const ContentModal = dynamic(() => import('src/components/dls/ContentModal/ContentModal'), {
  ssr: false,
});

type Props = {
  verse: Verse;
};

const TranslationVerseAction: React.FC<Props> = ({ verse }) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t, lang } = useTranslation('common');
  const selectedTranslations = useSelector(selectSelectedTranslations);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const contentModalRef = useRef<ContentModalHandles>();
  const translationsQueryKey = makeVersesUrl(verse.chapterId, lang, {
    page: verse.pageNumber,
    perPage: 1,
    translations: selectedTranslations.join(','),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
  });

  const renderTranslationsView = useCallback(
    (data: VersesResponse) => {
      if (!data) return <TranslationViewCellSkeleton hasActionMenuItems={false} />;
      const { verses } = data;
      return <TranslationsView verses={verses} quranReaderStyles={quranReaderStyles} />;
    },
    [quranReaderStyles],
  );

  const loading = useCallback(() => <TranslationViewCellSkeleton hasActionMenuItems={false} />, []);

  return (
    <>
      <PopoverMenu.Item
        icon={<TranslationsIcon />}
        onClick={() => {
          logButtonClick(`reading_view_verse_actions_menu_translations`);
          setIsContentModalOpen(true);
        }}
      >
        {t('translations')}
      </PopoverMenu.Item>
      <ContentModal
        innerRef={contentModalRef}
        isOpen={isContentModalOpen}
        header={<p className={styles.header}>{t('translations')}</p>}
        hasCloseButton
        onClose={() => {
          logEvent(`reading_view_translations_modal_close`);
          setIsContentModalOpen(false);
        }}
      >
        <DataFetcher
          loading={loading}
          queryKey={translationsQueryKey}
          render={renderTranslationsView}
        />
      </ContentModal>
    </>
  );
};

export default TranslationVerseAction;
