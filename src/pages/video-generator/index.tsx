/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Player, PlayerRef } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { getAvailableReciters, getChapterAudioData, getChapterVerses } from '@/api';
import VideoContent from '@/components/VideoGenerator/remotion/Video/VideoContent';
import styles from '@/components/VideoGenerator/video.module.scss';
import VideoSettings from '@/components/VideoGenerator/VideoSettings';
import {
  getNormalizedTimestamps,
  getStyles,
  getTrimmedAudio,
  getVideoById,
} from '@/components/VideoGenerator/VideoUtils';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import { getAllChaptersData } from '@/utils/chapter';
import {
  DEFAULT_API_PARAMS,
  VIDEO_FPS,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_LANDSCAPE_WIDTH,
  VIDEO_PORTRAIT_HEIGHT,
  VIDEO_PORTRAIT_WIDTH,
  DEFAULT_OPACITY,
  DEFAULT_BACKGROUND,
  DEFAULT_FONT_COLOR,
  Alignment,
  DEFAULT_TRANSLATION,
  Orientation,
} from '@/utils/videoGenerator/constants';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

let skipFirstRender = true;
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
  const { t, lang } = useTranslation('common');

  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);
  const [sceneBackgroundColor, setSceneBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [verseBackgroundColor, setVerseBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [fontColor, setFontColor] = useState(DEFAULT_FONT_COLOR);
  const [reciter, setReciter] = useState(DEFAULT_RECITER_ID);
  const [chapter, setChapter] = useState(DEFAULT_SURAH);
  const [verseData, setVerseData] = useState(verses?.verses);
  const [audioData, setAudioData] = useState(audio);
  const [timestamps, setTimestamps] = useState(defaultTimestamps);
  const [selectedTranslations, setSelectedTranslations] = useState([DEFAULT_TRANSLATION]);
  const [verseAlignment, setVerseAlignment] = useState<Alignment>(Alignment.CENTRE);
  const [translationAlignment, setTranslationAlignment] = useState<Alignment>(Alignment.CENTRE);
  const [border, setBorder] = useState('false');
  const [dimensions, setDimensions] = useState('landscape');
  const [video, setVideo] = useState(getVideoById(4));
  const [searchFetch, setSearchFetch] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [verseFrom, setVerseFrom] = useState('');
  const [verseTo, setVerseTo] = useState('');

  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (skipFirstRender) {
      skipFirstRender = false;
      setTimestamps(getNormalizedTimestamps(audioData));
      return;
    }

    let apiParams: any = {
      ...DEFAULT_API_PARAMS,
      translations: selectedTranslations,
      perPage: chaptersData[chapter].versesCount,
    };

    if (verseFrom) apiParams = { ...apiParams, from: `${chapter}:${verseFrom}` };
    if (verseTo) apiParams = { ...apiParams, to: `${chapter}:${verseTo}` };

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
        const trimmedAudio = getTrimmedAudio(audioRes, verseFrom, verseTo);
        setAudioData(trimmedAudio);
        setTimestamps(getNormalizedTimestamps(trimmedAudio));
      })
      .catch(() => {
        console.error('something went wrong');
      })
      .finally(() => setIsFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciter, selectedTranslations, searchFetch]);

  const onChapterChange = useCallback((val) => {
    setVerseFrom('');
    setVerseTo('');
    setChapter(val);
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

  const recitersOptions = useMemo(() => {
    const DEFAULT_RECITATION_STYLE = 'Murattal';

    return reciters.map((reciterObj) => {
      let label = reciterObj.translatedName.name;
      const recitationStyle = reciterObj.style.name;
      if (recitationStyle !== DEFAULT_RECITATION_STYLE) {
        label = `${label} - ${recitationStyle}`;
      }
      return {
        id: reciterObj.id,
        label,
        value: reciterObj.id,
        name: reciterObj.name,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const inputProps = useMemo(() => {
    return {
      verses: verseData,
      audio: audioData,
      timestamps,
      sceneBackground: sceneBackgroundColor?.background,
      verseBackground: verseBackgroundColor?.background,
      fontColor,
      stls: getStyles(dimensions),
      verseAlignment,
      translationAlignment,
      border,
      video,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timestamps,
    sceneBackgroundColor,
    verseBackgroundColor,
    fontColor,
    dimensions,
    verseAlignment,
    translationAlignment,
    border,
    video,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  if (hasError) {
    return <Error statusCode={500} />;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={classNames(styles.playerWrapper, layoutStyles.flowItem)}>
        <Player
          className={styles.player}
          component={VideoContent}
          inputProps={inputProps}
          durationInFrames={Math.ceil(((audioData.duration + 500) / 1000) * VIDEO_FPS)}
          compositionWidth={
            dimensions === Orientation.LANDSCAPE ? VIDEO_LANDSCAPE_WIDTH : VIDEO_PORTRAIT_WIDTH
          }
          compositionHeight={
            dimensions === 'landscape' ? VIDEO_LANDSCAPE_HEIGHT : VIDEO_PORTRAIT_HEIGHT
          }
          fps={VIDEO_FPS}
          ref={playerRef}
          controls
        />
      </div>
      <div className={layoutStyles.flow}>
        {/* TODO: This is just bad. Rather store these settings in redux and persist than passing like this */}
        <VideoSettings
          chaptersList={chaptersList}
          chapter={chapter}
          onChapterChange={onChapterChange}
          recitersOptions={recitersOptions}
          reciter={reciter}
          setReciter={setReciter}
          setSceneBackgroundColor={setSceneBackgroundColor}
          verseBackgroundColor={verseBackgroundColor}
          setVerseBackgroundColor={setVerseBackgroundColor}
          fontColor={fontColor}
          setFontColor={setFontColor}
          selectedTranslations={selectedTranslations}
          setSelectedTranslations={setSelectedTranslations}
          verseAlignment={verseAlignment}
          setVerseAlignment={setVerseAlignment}
          translationAlignment={translationAlignment}
          setTranslationAlignment={setTranslationAlignment}
          opacity={opacity}
          setOpacity={setOpacity}
          border={border}
          setBorder={setBorder}
          dimensions={dimensions}
          setDimensions={setDimensions}
          seekToBeginning={seekToBeginning}
          setVideo={setVideo}
          searchFetch={searchFetch}
          setSearchFetch={setSearchFetch}
          isFetching={isFetching}
          verseFrom={verseFrom}
          setVerseFrom={setVerseFrom}
          verseTo={verseTo}
          setVerseTo={setVerseTo}
          inputProps={inputProps}
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
