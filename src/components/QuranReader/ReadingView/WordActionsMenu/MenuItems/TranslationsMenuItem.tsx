import React, { useCallback, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import DataFetcher from '@/components/DataFetcher';
import ContentModalHandles from '@/components/dls/ContentModal/types/ContentModalHandles';
import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import TranslationsView from '@/components/QuranReader/ReadingView/TranslationsView';
import TranslationViewCellSkeleton from '@/components/QuranReader/TranslationView/TranslationViewCellSkeleton';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useSafeTimeout from '@/hooks/useSafeTimeout';
import TranslationsIcon from '@/icons/translation.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { WordVerse } from '@/types/Word';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { VerseResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

const ContentModal = dynamic(() => import('@/components/dls/ContentModal/ContentModal'), {
  ssr: false,
});

interface Props {
  verse: WordVerse | Verse;
  onActionTriggered?: () => void;
}

const CLOSE_POPOVER_AFTER_MS = 200;

const TranslationsMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const selectedTranslations = useSelector(selectSelectedTranslations);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const contentModalRef = useRef<ContentModalHandles>();
  const translationsQueryKey = makeByVerseKeyUrl(`${verse.chapterId}:${verse.verseNumber}`, {
    words: true,
    translationFields: 'resource_name,language_id',
    translations: selectedTranslations.join(','),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
  });

  const renderTranslationsView = useCallback(
    (data: VerseResponse) => {
      if (!data) return <TranslationViewCellSkeleton hasActionMenuItems={false} />;
      const { verse: responseVerse } = data;
      return <TranslationsView verse={responseVerse} quranReaderStyles={quranReaderStyles} />;
    },
    [quranReaderStyles],
  );

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_translations');
    setIsContentModalOpen(true);
  };

  // Use the safe timeout hook
  const setSafeTimeout = useSafeTimeout();

  const onModalClosed = () => {
    logEvent('reading_view_translations_modal_close');
    setIsContentModalOpen(false);

    // Use the safe timeout hook to handle cleanup automatically
    setSafeTimeout(() => {
      // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
      onActionTriggered?.();
    }, CLOSE_POPOVER_AFTER_MS);
  };

  const loading = useCallback(() => <TranslationViewCellSkeleton hasActionMenuItems={false} />, []);

  return (
    <>
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<TranslationsIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onMenuItemClicked}
      >
        {t('translations')}
      </PopoverMenu.Item>
      <ContentModal
        innerRef={contentModalRef}
        isOpen={isContentModalOpen}
        header={<p>{t('translations')}</p>}
        hasCloseButton
        onClose={onModalClosed}
        onEscapeKeyDown={onModalClosed}
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

export default TranslationsMenuItem;
