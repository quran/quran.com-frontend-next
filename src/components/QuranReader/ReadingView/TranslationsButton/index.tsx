import { useCallback, useRef, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './TranslationsButton.module.scss';

import DataFetcher from '@/components/DataFetcher';
import TranslationsView from '@/components/QuranReader/ReadingView/TranslationsView';
import TranslationViewCellSkeleton from '@/components/QuranReader/TranslationView/TranslationViewCellSkeleton';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import TranslationsIcon from '@/icons/translation.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { VerseResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

const ContentModal = dynamic(() => import('@/dls/ContentModal/ContentModal'), {
  ssr: false,
});

interface Props {
  verse: Verse;
  onActionTriggered: () => void;
}

const CLOSE_POPOVER_AFTER_MS = 200;

const TranslationsButton: React.FC<Props> = ({ verse, onActionTriggered }) => {
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

  const onButtonClicked = () => {
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `reading_view_translations_modal_open`,
    );
    setIsContentModalOpen(true);
  };

  const onModalClosed = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent(`reading_view_translations_modal_close`);
    setIsContentModalOpen(false);
    setTimeout(() => {
      // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
      onActionTriggered();
    }, CLOSE_POPOVER_AFTER_MS);
  };

  const loading = useCallback(() => <TranslationViewCellSkeleton hasActionMenuItems={false} />, []);

  return (
    <>
      <Button
        onClick={onButtonClicked}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        tooltip={t('translations')}
        shouldFlipOnRTL={false}
        shape={ButtonShape.Circle}
        className={classNames(styles.iconContainer, styles.verseAction)}
      >
        <span className={styles.icon}>
          <TranslationsIcon />
        </span>
      </Button>
      <ContentModal
        innerRef={contentModalRef}
        isOpen={isContentModalOpen}
        header={<p className={styles.header}>{t('translations')}</p>}
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

export default TranslationsButton;
