/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Player, PlayerRef, RenderPoster } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  prefetch,
  staticFile,
} from 'remotion';
import useSWRImmutable from 'swr/immutable';

import {
  getAvailableReciters,
  getAvailableTranslations,
  getChapterAudioData,
  getChapterVerses,
} from '@/api';
import styles from '@/components/MediaMaker/MediaMaker.module.scss';
import VideoSettings from '@/components/MediaMaker/Settings/VideoSettings';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMediaSettings from '@/hooks/auth/media/useGetMediaSettings';
import useAddQueryParamsToUrl from '@/hooks/useAddQueryParamsToUrl';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import AudioData from '@/types/AudioData';
import QueryParam from '@/types/QueryParam';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import Reciter from '@/types/Reciter';
import Translation from '@/types/Translation';
import { getMushafId } from '@/utils/api';
import { makeChapterAudioDataUrl, makeVersesUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getAllChaptersData } from '@/utils/chapter';
import { isAppleWebKit, isSafari } from '@/utils/device-detector';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  DEFAULT_API_PARAMS,
  DEFAULT_QURAN_FONT_STYLE,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
  DEFAULT_VERSE,
  VIDEO_FPS,
} from '@/utils/media/constants';
import {
  getBackgroundVideoById,
  getCurrentRangesAudioData,
  getDurationInFrames,
  getNormalizedTimestamps,
  orientationToDimensions,
} from '@/utils/media/utils';
import { getCanonicalUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';
import {
  ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface MediaMaker {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  reciters: Reciter[];
  translationsData: Translation[];
  verses: any;
  audio: any;
  chaptersData: ChaptersData;
  englishChaptersList: ChaptersData;
}

const MediaMaker: NextPage<MediaMaker> = ({
  hasError,
  chaptersData,
  englishChaptersList,
  reciters,
  verses: defaultVerses,
  audio: defaultAudio,
  translationsData,
}) => {
  const { t, lang } = useTranslation('common');
  const mediaSettings = useGetMediaSettings(reciters, translationsData);
  const [isReady, setIsReady] = useState(false);
  const [videoFileReady, setVideoFileReady] = useState(false);
  const [audioFileReady, setAudioFileReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [handleVideo] = useState(() => delayRender());
  const [handleAudio] = useState(() => delayRender());
  const areMediaFilesReady = videoFileReady && audioFileReady;

  const playerRef = useRef<PlayerRef>(null);

  const lazyComponent = useCallback(() => {
    return import('@/components/MediaMaker/Content');
  }, []);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const toast = useToast();
  const {
    surah,
    verseFrom,
    verseTo,
    reciter,
    translations,
    backgroundColor,
    opacity,
    borderColor,
    borderSize,
    fontColor,
    verseAlignment,
    translationAlignment,
    videoId,
    quranTextFontScale,
    quranTextFontStyle,
    translationFontScale,
    orientation,
  } = mediaSettings;

  const queryParams = {
    [QueryParam.SURAH]: String(surah),
    [QueryParam.VERSE_FROM]: String(verseFrom),
    [QueryParam.VERSE_TO]: String(verseTo),
    [QueryParam.RECITER]: String(reciter),
    [QueryParam.TRANSLATIONS]: String(translations),
    [QueryParam.BACKGROUND_COLOR]: backgroundColor,
    [QueryParam.OPACITY]: String(opacity),
    [QueryParam.BORDER_COLOR]: borderColor,
    [QueryParam.BORDER_SIZE]: String(borderSize),
    [QueryParam.FONT_COLOR]: fontColor,
    [QueryParam.VIDEO_ID]: String(videoId),
    [QueryParam.QURAN_TEXT_FONT_SCALE]: String(quranTextFontScale),
    [QueryParam.QURAN_TEXT_FONT_STYLE]: String(quranTextFontStyle),
    [QueryParam.TRANSLATION_FONT_SCALE]: String(translationFontScale),
    [QueryParam.ORIENTATION]: orientation,
  };

  useAddQueryParamsToUrl(getQuranMediaMakerNavigationUrl(queryParams), {});

  const seekToBeginning = useCallback(() => {
    const current = playerRef?.current;
    if (!current) {
      return;
    }
    if (current.isPlaying) {
      current.pause();
    }
    current.seekTo(0);
  }, []);

  useEffect(() => {
    setIsUpdating(false);
  }, [mediaSettings]);

  const API_PARAMS = useMemo(() => {
    return {
      ...DEFAULT_API_PARAMS,
      translations,
      from: `${surah}:${verseFrom}`,
      to: `${surah}:${verseTo}`,
      // the number of verses of the range
      perPage: Number(verseTo) - Number(verseFrom) + 1,
      mushaf: getMushafId(
        quranTextFontStyle,
        quranTextFontStyle === QuranFont.IndoPak ? MushafLines.SixteenLines : null,
      ).mushaf,
    };
  }, [quranTextFontStyle, surah, translations, verseFrom, verseTo]);

  const shouldRefetchVersesData = useMemo(() => {
    /**
     * Refetch data of the current verses If:
     *
     * 1. translations changed
     * 2. Range start Ayah changed
     * 3. Range end Ayah changed
     * 4. Reciter changes
     * 4. Font changes
     */
    return (
      !areArraysEqual(translations, DEFAULT_API_PARAMS.translations) ||
      verseFrom !== `${DEFAULT_SURAH}:${DEFAULT_VERSE}` ||
      verseTo !== `${DEFAULT_SURAH}:${DEFAULT_VERSE}` ||
      Number(reciter) !== DEFAULT_RECITER_ID ||
      quranTextFontStyle !== DEFAULT_QURAN_FONT_STYLE
    );
  }, [translations, verseFrom, verseTo, reciter, quranTextFontStyle]);

  const {
    data: verseData,
    isValidating: isVersesValidating,
    error: versesError,
  } = useSWRImmutable<VersesResponse>(
    makeVersesUrl(surah, lang, API_PARAMS),
    () => getChapterVerses(surah, lang, API_PARAMS),
    {
      fallbackData: defaultVerses,
      revalidateOnMount: shouldRefetchVersesData,
    },
  );
  // Refetch audio data if the reciter or chapter has changed
  const shouldRefetchAudioData =
    Number(reciter) !== DEFAULT_RECITER_ID || Number(surah) !== DEFAULT_SURAH;

  const {
    data: currentSurahAudioData,
    isValidating: isAudioValidating,
    error: audioError,
  } = useSWRImmutable<AudioData>(
    makeChapterAudioDataUrl(reciter, surah, true),
    () => getChapterAudioData(reciter, surah, true),
    {
      fallbackData: defaultAudio,
      // only revalidate when the reciter or chapter has changed
      revalidateOnMount: shouldRefetchAudioData,
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
    return englishChaptersList?.[surah]?.translatedName as string;
  }, [surah, englishChaptersList]);

  const getCurrentFrame = useCallback(() => {
    return playerRef?.current?.getCurrentFrame();
  }, []);

  const audioData = useMemo(() => {
    return getCurrentRangesAudioData(currentSurahAudioData, Number(verseFrom), Number(verseTo));
  }, [currentSurahAudioData, verseFrom, verseTo]);

  const timestamps = useMemo(() => {
    return getNormalizedTimestamps(audioData, VIDEO_FPS);
  }, [audioData]);

  const inputProps = useMemo(() => {
    return {
      verses: verseData.verses,
      audio: audioData,
      timestamps,
      backgroundColor,
      opacity,
      borderColor,
      borderSize,
      fontColor,
      verseAlignment,
      translationAlignment,
      video: getBackgroundVideoById(videoId),
      quranTextFontScale,
      quranTextFontStyle,
      translationFontScale,
      orientation,
      videoId,
      chapterEnglishName,
      isPlayer: true,
      translations,
    };
  }, [
    verseData.verses,
    translations,
    audioData,
    timestamps,
    backgroundColor,
    opacity,
    borderColor,
    borderSize,
    fontColor,
    verseAlignment,
    translationAlignment,
    videoId,
    quranTextFontScale,
    quranTextFontStyle,
    translationFontScale,
    orientation,
    chapterEnglishName,
  ]);

  useEffect(() => {
    setVideoFileReady(false);
    // {@see https://www.remotion.dev/docs/troubleshooting/player-flicker#option-6-prefetching-as-base64-to-avoid-network-request-and-local-http-server}
    const method = isAppleWebKit() ? 'base64' : 'blob-url';
    const { waitUntilDone: waitUntilVideoDone } = prefetch(
      staticFile(`/publicMin${inputProps.video.videoSrc}`),
      { method },
    );

    waitUntilVideoDone()
      .then(() => {
        setVideoFileReady(true);
        continueRender(handleVideo);
      })
      .catch((e) => {
        toast(`${e}`);
        cancelRender(e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputProps.video.videoSrc]);

  useEffect(() => {
    setAudioFileReady(false);
    // {@see https://www.remotion.dev/docs/troubleshooting/player-flicker#option-6-prefetching-as-base64-to-avoid-network-request-and-local-http-server}
    const method = isAppleWebKit() ? 'base64' : 'blob-url';
    const { waitUntilDone: waitUntilAudioDone } = prefetch(inputProps.audio.audioUrl, {
      method,
    });

    waitUntilAudioDone()
      .then(() => {
        setAudioFileReady(true);
        continueRender(handleAudio);
      })
      .catch((e) => {
        toast(`${e}`);
        cancelRender(e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputProps.audio.audioUrl]);

  const renderPoster: RenderPoster = useCallback(() => {
    const video = getBackgroundVideoById(videoId);

    if (isUpdating || isFetching || !areMediaFilesReady) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner className={styles.spinner} size={SpinnerSize.Large} />
        </div>
      );
    }

    return (
      <AbsoluteFill>
        <Image
          key={videoId}
          className={classNames(styles.img)}
          src={video.thumbnailSrc}
          layout="fill"
          style={{ zIndex: -1 }}
        />
      </AbsoluteFill>
    );
  }, [areMediaFilesReady, isFetching, isUpdating, videoId]);

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

  if (!isReady) {
    return <></>;
  }

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
          <>
            <div className={styles.titleContainer}>
              <h1>{t('quran-media-maker:title')}</h1>
            </div>

            <Player
              className={classNames(styles.player, {
                [styles.playerHeightSafari]: isSafari(),
                [styles.playerHeight]: !isSafari(),
              })}
              inputProps={inputProps}
              lazyComponent={lazyComponent}
              durationInFrames={getDurationInFrames(timestamps)}
              compositionWidth={width}
              compositionHeight={height}
              allowFullscreen
              doubleClickToFullscreen
              fps={VIDEO_FPS}
              ref={playerRef}
              controls={!isUpdating && !isFetching && areMediaFilesReady}
              bufferStateDelayInMilliseconds={200} // wait for 200ms second before showing the spinner
              renderPoster={renderPoster}
              posterFillMode="player-size"
              showPosterWhenUnplayed
              showPosterWhenPaused
              showPosterWhenBuffering
              showPosterWhenEnded
            />
          </>
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
            setIsUpdating={setIsUpdating}
          />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters } = await getAvailableReciters(locale, []);
    const { translations } = await getAvailableTranslations(locale);
    const chaptersData = await getAllChaptersData(locale);
    const englishChaptersList = await getAllChaptersData('en');
    const verses = await getChapterVerses(DEFAULT_SURAH, locale, DEFAULT_API_PARAMS);
    const chapterAudioData = await getChapterAudioData(DEFAULT_RECITER_ID, DEFAULT_SURAH, true);

    return {
      props: {
        audio: chapterAudioData,
        verses,
        chaptersData,
        englishChaptersList,
        reciters: reciters || [],
        translationsData: translations || [],
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
