/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { PlayerRef, Player } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import { getAvailableReciters, getChapterAudioData, getChapterVerses } from '@/api';
import MediaMakerContent from '@/components/MediaMaker/Content';
import styles from '@/components/MediaMaker/MediaMaker.module.scss';
import VideoSettings from '@/components/MediaMaker/Settings/VideoSettings';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMediaSettings from '@/hooks/auth/media/useGetMediaSettings';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import { makeChapterAudioDataUrl, makeVersesUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  DEFAULT_API_PARAMS,
  VIDEO_FPS,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
} from '@/utils/media/constants';
import {
  getNormalizedTimestamps,
  getCurrentRangesAudioData,
  getBackgroundVideoById,
  orientationToDimensions,
  getDurationInFrames,
} from '@/utils/media/utils';
import { getCanonicalUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';
import {
  ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';
import { getVerseNumberFromKey } from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface MediaMaker {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  reciters: any;
  verses: any;
  audio: any;
  chaptersData: ChaptersData;
  englishChaptersList: ChaptersData;
}

// TODO: this needs to be broken into multiple components
const MediaMaker: NextPage<MediaMaker> = ({
  hasError,
  chaptersData,
  englishChaptersList,
  reciters,
  verses,
  audio,
}) => {
  const { t, lang } = useTranslation('common');
  const mediaSettings = useGetMediaSettings();
  const toast = useToast();
  const {
    surah,
    verseFrom,
    verseTo,
    reciter,
    translations,
    backgroundColorId,
    opacity,
    fontColor,
    verseAlignment,
    translationAlignment,
    shouldHaveBorder,
    videoId,
    quranTextFontScale,
    translationFontScale,
    orientation,
  } = mediaSettings;

  const API_PARAMS = useMemo(() => {
    return {
      ...DEFAULT_API_PARAMS,
      translations,
      from: verseFrom,
      to: verseTo,
      // the number of verses of the range
      perPage: getVerseNumberFromKey(verseTo) - getVerseNumberFromKey(verseFrom) + 1,
    };
  }, [translations, verseFrom, verseTo]);

  const hasVersesAPIParamsChanged = useMemo(() => {
    return (
      !areArraysEqual(translations, DEFAULT_API_PARAMS.translations) ||
      verseFrom !== `${DEFAULT_SURAH}:1` ||
      verseTo !== `${DEFAULT_SURAH}:1` ||
      Number(reciter) !== DEFAULT_RECITER_ID
    );
  }, [translations, verseFrom, verseTo, reciter]);

  const {
    data: verseData,
    isValidating: isVersesValidating,
    error: versesError,
  } = useSWRImmutable(
    makeVersesUrl(surah, lang, API_PARAMS),
    () => getChapterVerses(surah, lang, API_PARAMS),
    {
      fallbackData: verses,
      revalidateOnMount: hasVersesAPIParamsChanged,
    },
  );

  const {
    data: chapterAudioData,
    isValidating: isAudioValidating,
    error: audioError,
  } = useSWRImmutable(
    makeChapterAudioDataUrl(reciter, surah, true),
    () => getChapterAudioData(reciter, surah, true),
    {
      fallbackData: audio,
      // only revalidate when the reciter or chapter has changed
      revalidateOnMount: Number(reciter) !== DEFAULT_RECITER_ID || surah !== DEFAULT_SURAH,
    },
  );

  // listen for errors and show a toast
  useEffect(() => {
    if (versesError || audioError) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    }
  }, [versesError, audioError, toast, t]);

  const isFetching = isVersesValidating || isAudioValidating;
  const chapterEnglishName = useMemo<string>(() => {
    return englishChaptersList[surah]?.translatedName as string;
  }, [surah, englishChaptersList]);
  const playerRef = useRef<PlayerRef>(null);
  const getCurrentFrame = useCallback(() => {
    return playerRef?.current?.getCurrentFrame();
  }, []);

  const seekToBeginning = useCallback(() => {
    const { current } = playerRef;
    if (!current) {
      return;
    }
    if (current.isPlaying) {
      current.pause();
    }
    current.seekTo(0);
  }, []);

  const audioData = useMemo(() => {
    return getCurrentRangesAudioData(
      chapterAudioData,
      getVerseNumberFromKey(verseFrom),
      getVerseNumberFromKey(verseTo),
    );
  }, [chapterAudioData, verseFrom, verseTo]);

  const timestamps = useMemo(() => {
    return getNormalizedTimestamps(audioData, VIDEO_FPS);
  }, [audioData]);

  const inputProps = useMemo(() => {
    return {
      verses: verseData.verses,
      audio: audioData,
      timestamps,
      backgroundColorId,
      opacity,
      fontColor,
      verseAlignment,
      translationAlignment,
      shouldHaveBorder,
      video: getBackgroundVideoById(videoId),
      quranTextFontScale,
      translationFontScale,
      orientation,
      videoId,
      chapterEnglishName,
    };
  }, [
    verseData.verses,
    audioData,
    timestamps,
    backgroundColorId,
    opacity,
    fontColor,
    verseAlignment,
    translationAlignment,
    shouldHaveBorder,
    videoId,
    quranTextFontScale,
    translationFontScale,
    orientation,
    chapterEnglishName,
  ]);

  const chaptersList = useMemo(() => {
    return Object.entries(chaptersData).map(([id, chapterObj], index) => ({
      id,
      label: `${chapterObj.transliteratedName} (${toLocalizedNumber(index + 1, lang)})`,
      value: id,
      name: chapterObj.transliteratedName,
    }));
  }, [chaptersData, lang]);

  if (hasError) {
    return <Error statusCode={500} />;
  }

  const { width, height } = orientationToDimensions(orientation);
  const PATH = getQuranMediaMakerNavigationUrl();

  return (
    <>
      <NextSeoWrapper
        title={t('quran-media-maker:maker-title')}
        description={t('quran-media-maker:maker-meta-desc')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <div className={styles.pageContainer}>
        <div className={classNames(styles.playerWrapper, layoutStyles.flowItem)}>
          {isFetching ? (
            <div className={styles.loadingContainer}>
              <Spinner size={SpinnerSize.Large} />
            </div>
          ) : (
            <Player
              className={styles.player}
              component={MediaMakerContent}
              inputProps={inputProps}
              durationInFrames={getDurationInFrames(timestamps)}
              compositionWidth={width}
              compositionHeight={height}
              fps={VIDEO_FPS}
              ref={playerRef}
              controls
            />
          )}
        </div>
        <div className={layoutStyles.flow}>
          <VideoSettings
            chaptersList={chaptersList}
            reciters={reciters}
            seekToBeginning={seekToBeginning}
            getCurrentFrame={getCurrentFrame}
            isFetching={isFetching}
            inputProps={inputProps}
            mediaSettings={mediaSettings}
          />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters } = await getAvailableReciters(locale, []);
    const chaptersData = await getAllChaptersData(locale);
    const englishChaptersList = await getAllChaptersData();
    const verses = await getChapterVerses(DEFAULT_SURAH, locale, DEFAULT_API_PARAMS);
    const chapterAudioData = await getChapterAudioData(DEFAULT_RECITER_ID, DEFAULT_SURAH, true);

    return {
      props: {
        audio: chapterAudioData,
        verses,
        chaptersData,
        englishChaptersList,
        reciters: reciters || [],
      },
      revalidate: ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (e) {
    return {
      props: {
        hasError: true,
        revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
      },
    };
  }
};

export default MediaMaker;
