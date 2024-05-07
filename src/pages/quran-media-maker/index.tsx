/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Player, PlayerRef } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import { getAvailableReciters, getChapterAudioData, getChapterVerses } from '@/api';
import MediaMakerContent from '@/components/MediaMaker/Content';
import styles from '@/components/MediaMaker/MediaMaker.module.scss';
import VideoSettings from '@/components/MediaMaker/Settings/VideoSettings';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import { selectMediaMakerSettings } from '@/redux/slices/mediaMaker';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import {
  DEFAULT_API_PARAMS,
  VIDEO_FPS,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
  getDefaultVerseKeys,
} from '@/utils/media/constants';
import {
  getNormalizedTimestamps,
  getTrimmedAudio,
  getBackgroundVideoById,
  orientationToDimensions,
  getVerseFromVerseKey,
} from '@/utils/media/utils';
import { getCanonicalUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';
import {
  ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';
import { generateChapterVersesKeys } from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface MediaMaker {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  reciters: any;
  verses: any;
  audio: any;
  defaultTimestamps: any;
  chaptersData: ChaptersData;
  englishChaptersList: ChaptersData;
}

/**
 * hmm, yes the public folder is always included in a webpack bundle.
 * we don't have a way to filter out specific files, but you can specify
 * a different public folder using the publicDir option for bundleSite().
 *
 * if you want to filter the public dir, you need to use bundle() with the
 * right publicPath (/sites/your-s3-subfolder), filter out the files from
 * the directoy that gets generated and then upload it to S3 manually. you
 * may use deploySite() source code as a reference:
 * https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/deploy-site.ts
 */

const MediaMaker: NextPage<MediaMaker> = ({
  hasError,
  chaptersData,
  englishChaptersList,
  reciters,
  verses,
  audio,
  defaultTimestamps,
}) => {
  const { t, lang } = useTranslation('common');

  const {
    shouldHaveBorder,
    backgroundColorId,
    opacity,
    reciter,
    quranTextFontScale,
    translationFontScale,
    translations,
    fontColor,
    verseAlignment,
    translationAlignment,
    orientation,
    videoId,
  } = useSelector(selectMediaMakerSettings);
  const [chapter, setChapter] = useState(DEFAULT_SURAH);
  const [verseData, setVerseData] = useState(verses?.verses);
  const [audioData, setAudioData] = useState(audio);
  const [timestamps, setTimestamps] = useState(defaultTimestamps);
  const [shouldSearchFetch, setShouldSearchFetch] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [verseFrom, setVerseFrom] = useState('');
  const [verseTo, setVerseTo] = useState('');
  const [verseKeys, setVerseKeys] = useState(getDefaultVerseKeys());

  const chapterEnglishName = useMemo<string>(() => {
    return englishChaptersList[chapter]?.translatedName as string;
  }, [chapter, englishChaptersList]);

  const playerRef = useRef<PlayerRef>(null);

  const getCurrentFrame = useCallback(() => {
    return playerRef?.current?.getCurrentFrame();
  }, []);

  const updateVerseKeys = useCallback(
    (chapterId: number) => {
      const keys = generateChapterVersesKeys(chaptersData, String(chapterId));
      setVerseKeys(
        keys.map((chapterVersesKey) => ({
          id: chapterVersesKey,
          name: chapterVersesKey,
          value: chapterVersesKey,
          label: toLocalizedVerseKey(chapterVersesKey, lang),
        })),
      );
    },
    [chaptersData, lang],
  );

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

  useEffect(() => {
    let apiParams: any = {
      ...DEFAULT_API_PARAMS,
      translations,
      perPage: chaptersData[chapter].versesCount,
    };

    if (verseFrom) apiParams = { ...apiParams, from: verseFrom };
    if (verseTo) apiParams = { ...apiParams, to: verseTo };

    const fetchData = async () => {
      const versesRes = await getChapterVerses(chapter, lang, apiParams);
      const audioRes = await getChapterAudioData(reciter, chapter, true);
      return [versesRes, audioRes];
    };
    setIsFetching(true);
    fetchData()
      .then(([versesRes, audioRes]) => {
        seekToBeginning();
        setVerseData((versesRes as any)?.verses);
        const trimmedAudio = getTrimmedAudio(
          audioRes,
          getVerseFromVerseKey(verseFrom),
          getVerseFromVerseKey(verseTo),
        );
        setAudioData(trimmedAudio);
        setTimestamps(getNormalizedTimestamps(trimmedAudio));
        updateVerseKeys(chapter);
      })
      .catch(() => {
        // TODO: need a message to show the user
        console.error('something went wrong');
      })
      .finally(() => setIsFetching(false));
  }, [
    reciter,
    translations,
    shouldSearchFetch,
    chaptersData,
    chapter,
    verseFrom,
    verseTo,
    lang,
    seekToBeginning,
    updateVerseKeys,
  ]);

  const onChapterChange = useCallback((val) => {
    setVerseFrom('');
    setVerseTo('');
    setChapter(val);
  }, []);

  const inputProps = useMemo(() => {
    return {
      verses: verseData,
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
      translations,
      orientation,
      videoId,
      verseKeys,
      chapterEnglishName,
    };
  }, [
    verseData,
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
    translations,
    orientation,
    verseKeys,
    chapterEnglishName,
  ]);

  const chaptersList = useMemo(() => {
    const flattenedChaptersList = Object.entries(chaptersData).map((r) => ({
      id: r[0],
      ...r[1],
    }));
    return flattenedChaptersList.map((chapterObj, index) => {
      return {
        id: chapterObj.id,
        label: `${chapterObj.transliteratedName} (${toLocalizedNumber(index + 1, lang)})`,
        value: chapterObj.id,
        name: chapterObj.transliteratedName,
      };
    });
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
              durationInFrames={Math.ceil(((audioData.duration + 500) / 1000) * VIDEO_FPS)}
              compositionWidth={width}
              compositionHeight={height}
              fps={VIDEO_FPS}
              ref={playerRef}
              controls
            />
          )}
        </div>
        <div className={layoutStyles.flow}>
          {/* TODO: This is just bad. Rather store these settings in redux and persist than passing like this */}
          <VideoSettings
            chaptersList={chaptersList}
            chapter={chapter}
            onChapterChange={onChapterChange}
            reciters={reciters}
            seekToBeginning={seekToBeginning}
            getCurrentFrame={getCurrentFrame}
            shouldSearchFetch={shouldSearchFetch}
            setShouldSearchFetch={setShouldSearchFetch}
            isFetching={isFetching}
            verseFrom={verseFrom}
            setVerseFrom={setVerseFrom}
            verseTo={verseTo}
            setVerseTo={setVerseTo}
            inputProps={inputProps}
            verseKeys={verseKeys}
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
    const defaultTimestamps = getNormalizedTimestamps(chapterAudioData);

    return {
      props: {
        audio: chapterAudioData,
        verses,
        chaptersData,
        englishChaptersList,
        defaultTimestamps,
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
