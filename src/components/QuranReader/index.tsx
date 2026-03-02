import { useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import ContextMenu from './ContextMenu';
import { VerseTrackerContextProvider } from './contexts/VerseTrackerContext';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import {
  getReaderBannerAnalyticsParams,
  getReaderBannerAnalyticsSource,
} from './fundraisingAnalytics';
import useSyncChapterPage from './hooks/useSyncChapterPage';
import Notes from './Notes/Notes';
import styles from './QuranReader.module.scss';
import QuranReaderView from './QuranReaderView';
import ReaderTopActions from './ReaderTopActions';

import FontPreLoader from '@/components/Fonts/FontPreLoader';
import HomepageFundraisingBanner, {
  FundraisingBannerContext,
  FundraisingBannerLayout,
} from '@/components/Fundraising/HomepageFundraisingBanner';
import useGetMushaf from '@/hooks/useGetMushaf';
import useIsMobile from '@/hooks/useIsMobile';
import { selectIsQuranReaderFloatingBannerVisible } from '@/redux/slices/fundraisingBanner';
import { selectIsExpanded } from '@/redux/slices/QuranReader/contextMenu';
import { selectNotes } from '@/redux/slices/QuranReader/notes';
import { selectPinnedVerseKeys } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { selectStudyModeIsOpen } from '@/redux/slices/QuranReader/studyMode';
import { selectQuranReaderStyles, selectShowTajweedRules } from '@/redux/slices/QuranReader/styles';
import { Mushaf, QuranReaderDataType, ReadingPreference } from '@/types/QuranReader';
import isInReadingMode from '@/utils/readingPreference';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { VersesResponse } from 'types/ApiResponses';

type QuranReaderProps = {
  initialData: VersesResponse;
  id: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
  quranReaderDataType?: QuranReaderDataType;
};

const QuranReader = ({
  initialData,
  id,
  quranReaderDataType = QuranReaderDataType.Chapter,
}: QuranReaderProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const { lang } = useTranslation();
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const readingPreference = useSelector(selectReadingPreference) as ReadingPreference;
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const isQuranReaderBannerVisible = useSelector(selectIsQuranReaderFloatingBannerVisible);
  const isReadingPreference = isInReadingMode(readingPreference);
  const isMobile = useIsMobile();
  const isExpanded = useSelector(selectIsExpanded);
  const mushaf = useGetMushaf();
  const pinnedVerseKeys = useSelector(selectPinnedVerseKeys, shallowEqual);
  const hasPinnedVerses = pinnedVerseKeys.length > 0;
  const showTajweedRules = useSelector(selectShowTajweedRules);
  const isAudioPlayerVisible =
    useXstateSelector(audioService, (state) => state.matches('VISIBLE')) && !isStudyModeOpen;

  // Mobile collapsed state: when scrolled past threshold on mobile
  const isMobileCollapsed = isMobile && !isExpanded;
  const isTajweedMushaf = mushaf === Mushaf.QCFTajweedV4;
  // Tajweed bar is hidden only in ReadingTranslation mode
  const isReadingTranslationMode = readingPreference === ReadingPreference.ReadingTranslation;
  const showTajweedPadding = isTajweedMushaf && !isReadingTranslationMode && showTajweedRules;

  const isSingleVerse = quranReaderDataType === QuranReaderDataType.Verse;

  useSyncChapterPage(initialData);

  return (
    <>
      <FontPreLoader isQuranReader locale={lang} />
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
      <div
        className={classNames(styles.container, {
          [styles.withVisibleSideBar]: isSideBarVisible,
          [styles.withSidebarNavigationOpenOrAuto]: isSidebarNavigationVisible,
          [styles.translationView]: !isReadingPreference,
          [styles.singleVerseView]: isSingleVerse,
          [styles.mobileCollapsed]: isMobileCollapsed && !showTajweedPadding,
          [styles.mobileCollapsedTajweed]: isMobileCollapsed && showTajweedPadding,
          [styles.mobileTajweedExpanded]: isMobile && !isMobileCollapsed && showTajweedPadding,
          [styles.desktopTajweed]: !isMobile && showTajweedPadding,
          [styles.withPinnedVerses]: hasPinnedVerses,
        })}
      >
        <div
          className={classNames(styles.infiniteScroll, {
            [styles.readingView]: isReadingPreference,
            [styles.singleVerseReadingView]: isSingleVerse,
          })}
        >
          <VerseTrackerContextProvider>
            <ReaderTopActions initialData={initialData} quranReaderDataType={quranReaderDataType} />
            <QuranReaderView
              isReadingPreference={isReadingPreference}
              readingPreference={readingPreference}
              quranReaderStyles={quranReaderStyles}
              initialData={initialData}
              quranReaderDataType={quranReaderDataType}
              resourceId={id}
            />
          </VerseTrackerContextProvider>
        </div>
      </div>
      {isQuranReaderBannerVisible && (
        <div
          className={classNames(styles.floatingDonationBanner, {
            [styles.floatingDonationBannerWithAudio]: isAudioPlayerVisible,
          })}
        >
          <HomepageFundraisingBanner
            context={FundraisingBannerContext.QuranReader}
            layout={FundraisingBannerLayout.Floating}
            analyticsSource={getReaderBannerAnalyticsSource(quranReaderDataType)}
            analyticsParams={getReaderBannerAnalyticsParams(
              quranReaderDataType,
              id,
              initialData?.verses?.[0],
            )}
          />
        </div>
      )}
      <Notes />
    </>
  );
};

export default QuranReader;
