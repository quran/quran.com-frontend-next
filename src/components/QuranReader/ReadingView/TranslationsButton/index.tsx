import { useCallback, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

import TranslationsIcon from '../../../../../public/icons/translation.svg';

import styles from './TranslationsButton.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import ContentModalHandles from 'src/components/dls/ContentModal/types/ContentModalHandles';
import TranslationsView from 'src/components/QuranReader/ReadingView/TranslationsView';
import TranslationViewCellSkeleton from 'src/components/QuranReader/TranslationView/TranslatioViewCellSkeleton';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeByVerseKeyUrl } from 'src/utils/apiPaths';
import { logButtonClick, logEvent } from 'src/utils/eventLogger';
import { VerseResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

const ContentModal = dynamic(() => import('src/components/dls/ContentModal/ContentModal'), {
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
