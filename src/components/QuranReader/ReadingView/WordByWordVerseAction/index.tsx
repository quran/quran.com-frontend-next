import { useCallback, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import WordByWordHeading from './WordByWordHeading';
import WordByWordSkeleton from './WordByWordSkeleton';
import styles from './WordByWordVerseAction.module.scss';

import { fetcher } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import PlainVerseText from '@/components/Verse/PlainVerseText';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Separator from '@/dls/Separator/Separator';
import SearchIcon from '@/icons/search-book.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { VersesResponse } from '@/types/ApiResponses';
import { WordVerse } from '@/types/Word';
import { getMushafId, getDefaultWordFields } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getVerseWords } from '@/utils/verse';

const ContentModal = dynamic(() => import('@/dls/ContentModal/ContentModal'), {
  ssr: false,
});

type Props = {
  verse: WordVerse;
  onActionTriggered?: () => void;
  isTranslationView?: boolean;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const WordByWordVerseAction: React.FC<Props> = ({
  verse,
  onActionTriggered,
  isTranslationView,
}) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t, lang } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf } = getMushafId(quranFont, mushafLines);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);

  const onModalClosed = () => {
    logEvent(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_reading_view_wbw_modal_close`,
    );
    setIsContentModalOpen(false);
    if (onActionTriggered) {
      setTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  const onIconClicked = () => {
    logButtonClick(
      `${
        isTranslationView ? 'translation_view' : 'reading_view'
      }_reading_view_verse_actions_menu_wbw`,
    );
    setIsContentModalOpen(true);
  };

  // Extract chapter ID and verse number from the verse prop
  const chapterId =
    typeof verse.chapterId === 'string' ? verse.chapterId : verse.chapterId.toString();
  const { verseNumber } = verse;

  // Loading component for DataFetcher
  const loading = useCallback(() => <WordByWordSkeleton />, []);

  // API parameters for fetching verse data
  const apiParams = {
    words: true,
    perPage: 1,
    translations: selectedTranslations.join(','),
    page: verseNumber,
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    mushaf,
  };

  return (
    <>
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<SearchIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onIconClicked}
      >
        {t('wbw')}
      </PopoverMenu.Item>
      <ContentModal
        innerRef={contentModalRef}
        isOpen={isContentModalOpen}
        header={<p className={styles.header} />}
        hasCloseButton
        onClose={onModalClosed}
        onEscapeKeyDown={onModalClosed}
      >
        {isContentModalOpen && (
          <DataFetcher
            queryKey={`wbw-verse-${chapterId}:${verseNumber}`}
            loading={loading}
            fetcher={() => fetcher(makeVersesUrl(chapterId, lang, apiParams))}
            render={(data: VersesResponse) => {
              if (!data || !data.verses || data.verses.length === 0) {
                return <p className={styles.fallbackMessage}>{t('no-verses-available')}</p>;
              }

              const words = data.verses.map((verseItem) => getVerseWords(verseItem)).flat();

              return (
                <>
                  <WordByWordHeading isTranslation />
                  <PlainVerseText words={words} shouldShowWordByWordTranslation />
                  <Separator className={styles.separator} />
                  <WordByWordHeading isTranslation={false} />
                  <PlainVerseText words={words} shouldShowWordByWordTransliteration />
                </>
              );
            }}
          />
        )}
      </ContentModal>
    </>
  );
};

export default WordByWordVerseAction;
