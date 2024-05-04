/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Player, PlayerRef } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import { getAvailableReciters, getChapterAudioData, getChapterVerses } from '@/api';
import VideoContent from '@/components/VideoGenerator/remotion/Video/VideoContent';
import VideoSettings from '@/components/VideoGenerator/Settings/VideoSettings';
import styles from '@/components/VideoGenerator/video.module.scss';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import { selectVideoGeneratorSettings } from '@/redux/slices/videoGenerator';
import { getAllChaptersData } from '@/utils/chapter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { generateChapterVersesKeys } from '@/utils/verse';
import {
  DEFAULT_API_PARAMS,
  VIDEO_FPS,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
  getDefaultVerseKeys,
} from '@/utils/videoGenerator/constants';
import {
  getNormalizedTimestamps,
  getTrimmedAudio,
  getBackgroundVideoById,
  orientationToDimensions,
  getVerseFromVerseKey,
} from '@/utils/videoGenerator/utils';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface VideoGenerator {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  reciters: any;
  verses: any;
  audio: any;
  defaultTimestamps: any;
  chaptersData: ChaptersData;
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

const VideoGenerator: NextPage<VideoGenerator> = ({
  hasError,
  chaptersData,
  reciters,
  verses,
  audio,
  defaultTimestamps,
}) => {
  const { lang } = useTranslation('common');

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
  } = useSelector(selectVideoGeneratorSettings);
  const [chapter, setChapter] = useState(DEFAULT_SURAH);
  const [verseData, setVerseData] = useState(verses?.verses);
  const [audioData, setAudioData] = useState(audio);
  const [timestamps, setTimestamps] = useState(defaultTimestamps);
  const [shouldSearchFetch, setShouldSearchFetch] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [verseFrom, setVerseFrom] = useState('');
  const [verseTo, setVerseTo] = useState('');
  const [verseKeys, setVerseKeys] = useState(getDefaultVerseKeys());

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

  // eslint-disable-next-line react-func/max-lines-per-function
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciter, translations, shouldSearchFetch, chapter, lang, seekToBeginning]);

  const updateVerseKeys = useCallback((chapter) => {
    const keys = generateChapterVersesKeys(chaptersData, String(chapter));
    setVerseKeys(
      keys.map((chapterVersesKey) => ({
        id: chapterVersesKey,
        name: chapterVersesKey,
        value: chapterVersesKey,
        label: toLocalizedVerseKey(chapterVersesKey, lang),
      })),
    );
  }, []);

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
    };
  }, [
    verseData,
    audioData,
    timestamps,
    backgroundColorId,
    opacity,
    fontColor,
    orientation,
    verseAlignment,
    translationAlignment,
    shouldHaveBorder,
    videoId,
    quranTextFontScale,
    translationFontScale,
    translations,
    verseKeys,
  ]);

  const chaptersList = useMemo(() => {
    const flattenedChaptersList = Object.entries(chaptersData).map((r) => ({
      id: r[0],
      ...r[1],
    }));
    return flattenedChaptersList.map((chapterObj) => {
      return {
        id: chapterObj.id,
        label: chapterObj.transliteratedName,
        value: chapterObj.id,
        name: chapterObj.transliteratedName,
      };
    });
  }, [chaptersData]);

  if (hasError) {
    return <Error statusCode={500} />;
  }

  const { width, height } = orientationToDimensions(orientation);

  return (
    <div className={styles.pageContainer}>
      <div className={classNames(styles.playerWrapper, layoutStyles.flowItem)}>
        {isFetching ? (
          <div className={styles.loadingContainer}>
            <Spinner size={SpinnerSize.Large} />
          </div>
        ) : (
          <Player
            className={styles.player}
            component={VideoContent}
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
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters } = await getAvailableReciters(locale, []);
    const chaptersData = await getAllChaptersData(locale);
    const verses = await getChapterVerses(DEFAULT_SURAH, locale, DEFAULT_API_PARAMS);
    const chapterAudioData = await getChapterAudioData(DEFAULT_RECITER_ID, DEFAULT_SURAH, true);
    const defaultTimestamps = getNormalizedTimestamps(chapterAudioData);

    return {
      props: {
        audio: chapterAudioData,
        verses,
        chaptersData,
        defaultTimestamps,
        reciters: reciters || [],
      },
    };
  } catch (e) {
    return {
      props: {
        hasError: true,
      },
    };
  }
};

export default VideoGenerator;
