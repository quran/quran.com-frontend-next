/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Player, PlayerRef, RenderPoster } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { AbsoluteFill, cancelRender, prefetch, staticFile } from 'remotion';
import useSWRImmutable from 'swr/immutable';

import {
  getAvailableReciters,
  getAvailableTranslations,
  getChapterAudioData,
  getChapterVerses,
} from '@/api';
import PlayerContent from '@/components/MediaMaker/Content';
import styles from '@/components/MediaMaker/MediaMaker.module.scss';
import VideoSettings from '@/components/MediaMaker/Settings/VideoSettings';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMediaSettings from '@/hooks/auth/media/useGetMediaSettings';
import useAddQueryParamsToUrl from '@/hooks/useAddQueryParamsToUrl';
import { getMediaGeneratorOgImageUrl } from '@/lib/og';
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
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { isChromeIOS, isSafari } from '@/utils/device-detector';
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
import { isValidVerseFrom, isValidVerseKey, isValidVerseTo } from '@/utils/validator';
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
  const TOAST_GENERAL_ERROR = t('common:error.general');
  const areMediaFilesReady = videoFileReady && audioFileReady;

  const playerRef = useRef<PlayerRef>(null);

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
    [QueryParam.MEDIA_TRANSLATIONS]: String(translations),
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
    makeVersesUrl(surah, lang, API_PARAMS, true),
    () => getChapterVerses(surah, lang, API_PARAMS, true),
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
    makeChapterAudioDataUrl(reciter, surah, true, true),
    () => getChapterAudioData(reciter, surah, true, true),
    {
      fallbackData: defaultAudio,
      // only revalidate when the reciter or chapter has changed
      revalidateOnMount: shouldRefetchAudioData,
    },
  );

  // listen for errors and show a toast
  useEffect(() => {
    if (versesError || audioError) {
      toast(TOAST_GENERAL_ERROR, {
        status: ToastStatus.Error,
      });
    }
  }, [versesError, audioError, toast, TOAST_GENERAL_ERROR]);

  const isFetching = isVersesValidating || isAudioValidating;
  const chapterEnglishName = useMemo<string>(() => {
    return englishChaptersList?.[surah]?.translatedName as string;
  }, [surah, englishChaptersList]);

  // Since we get the {{verseFrom}} and {{verseTo}} from the mediaSettings they will be available immediately,
  // however this is not the case for {{currentSurahAudioData}}, so we validate the verses against the surah from {{currentSurahAudioData}}
  // and return defaultAudio if it is not valid and return the surahAudio if they are valid.
  const audioData = useMemo(() => {
    const chapterId = String(currentSurahAudioData.chapterId);
    const startVerseKey = `${chapterId}:${verseFrom}`;
    const endVerseKey = `${chapterId}:${verseTo}`;
    const isValidAudioVerseFromKey = isValidVerseKey(chaptersData, startVerseKey);
    const isValidAudioVerseToKey = isValidVerseKey(chaptersData, endVerseKey);

    if (!isValidAudioVerseFromKey || !isValidAudioVerseToKey) {
      return defaultAudio;
    }

    const chapterData = getChapterData(chaptersData, chapterId);
    const isValidAudioVerses =
      isValidVerseFrom(startVerseKey, endVerseKey, chapterData.versesCount, chapterId) &&
      isValidVerseTo(startVerseKey, endVerseKey, chapterData.versesCount, chapterId);

    if (!isValidAudioVerses) {
      return defaultAudio;
    }

    return getCurrentRangesAudioData(currentSurahAudioData, Number(verseFrom), Number(verseTo));
  }, [chaptersData, currentSurahAudioData, defaultAudio, verseFrom, verseTo]);

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

  const method = isChromeIOS() ? 'base64' : 'blob-url';
  useEffect(() => {
    setVideoFileReady(false);
    // {@see https://www.remotion.dev/docs/troubleshooting/player-flicker#option-6-prefetching-as-base64-to-avoid-network-request-and-local-http-server}
    const { waitUntilDone: waitUntilVideoDone } = prefetch(
      staticFile(`/publicMin${inputProps.video.videoSrc}`),
      { method },
    );

    waitUntilVideoDone()
      .then(() => {
        setVideoFileReady(true);
      })
      .catch((e) => {
        toast(TOAST_GENERAL_ERROR, {
          status: ToastStatus.Error,
        });
        cancelRender(e);
      });
  }, [inputProps.video.videoSrc, toast, TOAST_GENERAL_ERROR, method]);

  useEffect(() => {
    if (inputProps.audio.audioUrl !== defaultAudio.audioUrl || !shouldRefetchAudioData) {
      setAudioFileReady(false);
      // {@see https://www.remotion.dev/docs/troubleshooting/player-flicker#option-6-prefetching-as-base64-to-avoid-network-request-and-local-http-server}
      const { waitUntilDone: waitUntilAudioDone } = prefetch(inputProps.audio.audioUrl, {
        method,
      });

      waitUntilAudioDone()
        .then(() => {
          setAudioFileReady(true);
        })
        .catch((e) => {
          toast(TOAST_GENERAL_ERROR, {
            status: ToastStatus.Error,
          });
          cancelRender(e);
        });
    }
  }, [
    inputProps.audio.audioUrl,
    toast,
    TOAST_GENERAL_ERROR,
    defaultAudio.audioUrl,
    audioData.audioUrl,
    shouldRefetchAudioData,
    method,
  ]);

  const renderPoster: RenderPoster = useCallback(() => {
    const video = getBackgroundVideoById(videoId);

    if (isFetching || !areMediaFilesReady) {
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
  }, [areMediaFilesReady, isFetching, videoId]);

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

  const SEOComponent = (
    <NextSeoWrapper
      title={t('media:maker-title')}
      description={t('media:maker-meta-desc')}
      url={getCanonicalUrl(lang, PATH)}
      languageAlternates={getLanguageAlternates(PATH)}
      image={getMediaGeneratorOgImageUrl({
        locale: lang,
      })}
      imageWidth={1200}
      imageHeight={630}
    />
  );

  if (!isReady) {
    return <>{SEOComponent}</>;
  }

  return (
    <>
      {SEOComponent}
      <div className={styles.pageContainer}>
        <div className={classNames(styles.playerWrapper, layoutStyles.flowItem)}>
          <>
            <div className={styles.titleContainer}>
              <h1>{t('media:title')}</h1>
            </div>

            <Player
              className={classNames(styles.player, {
                [styles.playerHeightSafari]: isSafari(),
                [styles.playerHeight]: !isSafari(),
              })}
              inputProps={inputProps}
              component={PlayerContent}
              durationInFrames={getDurationInFrames(timestamps)}
              compositionWidth={width}
              compositionHeight={height}
              allowFullscreen
              doubleClickToFullscreen
              fps={VIDEO_FPS}
              ref={playerRef}
              controls={!isFetching && areMediaFilesReady}
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
            playerRef={playerRef}
            isFetching={isFetching}
            inputProps={inputProps}
            mediaSettings={mediaSettings}
          />
        </div>
      </div>
    </>
  );
};

const fetchRecitersAndTranslations = async (locale) => {
  const { reciters } = await getAvailableReciters(locale, [], true);
  const { translations } = await getAvailableTranslations(locale, true);
  return { reciters, translations };
};

const fetchChapterData = async (locale) => {
  const chaptersData = await getAllChaptersData(locale);
  const englishChaptersList = await getAllChaptersData('en');
  return { chaptersData, englishChaptersList };
};

const fetchVersesAndAudio = async (locale) => {
  const verses = await getChapterVerses(DEFAULT_SURAH, locale, DEFAULT_API_PARAMS, true);
  const chapterAudioData = await getChapterAudioData(DEFAULT_RECITER_ID, DEFAULT_SURAH, true, true);
  return { verses, chapterAudioData };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters, translations } = await fetchRecitersAndTranslations(locale);
    const { chaptersData, englishChaptersList } = await fetchChapterData(locale);
    const { verses, chapterAudioData } = await fetchVersesAndAudio(locale);

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
