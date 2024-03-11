/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Player, PlayerRef } from '@remotion/player';
import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { VideoContent } from '../../remotion/Video/Main';
import layoutStyle from '../index.module.scss';

import { getAvailableReciters, getChapterAudioData, getChapterVerses } from '@/api';
import styles from '@/components/VideoGenerator/video.module.scss';
import VideoSettings from '@/components/VideoGenerator/VideoSettings';
import {
  getAllBackgrounds,
  getNormalizedTimestamps,
  getStyles,
  getTrimmedAudio,
  getVideoById,
} from '@/components/VideoGenerator/VideoUtils';
import Error from '@/pages/_error';
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

const defaultOpacity = '0.2';
const defaultBackground = getAllBackgrounds(defaultOpacity)[0];

const VideoGenerator: NextPage<VideoGenerator> = ({
  hasError,
  chaptersData,
  reciters,
  verses,
  audio,
  defaultTimestamps,
}) => {
  const { t, lang } = useTranslation('common');

  const [opacity, setOpacity] = useState(defaultOpacity);
  const [sceneBackgroundColor, setSceneBackgroundColor] = useState(defaultBackground);
  const [verseBackgroundColor, setVerseBackgroundColor] = useState(defaultBackground);
  const [fontColor, setFontColor] = useState('#dddddd');
  const [reciter, setReciter] = useState(7);
  const [chapter, setChapter] = useState(112);
  const [verseData, setverseData] = useState(verses?.verses);
  const [audioData, setAudioData] = useState(audio);
  const [timestamps, setTimestamps] = useState(defaultTimestamps);
  const [selectedTranslations, setSelectedTranslations] = useState([131]);
  const [verseAlignment, setVerseAlignment] = useState('centre');
  const [translationAlignment, setTranslationAlignment] = useState('centre');
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
        setverseData((versesRes as any)?.verses);
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
      <div className={classNames(styles.playerWrapper, layoutStyle.flowItem)}>
        <Player
          style={{ width: '100%', height: '100%' }}
          component={VideoContent}
          inputProps={inputProps}
          durationInFrames={Math.ceil(((audioData.duration + 500) / 1000) * VIDEO_FPS)}
          compositionWidth={
            dimensions === 'landscape' ? VIDEO_LANDSCAPE_WIDTH : VIDEO_PORTRAIT_WIDTH
          }
          compositionHeight={
            dimensions === 'landscape' ? VIDEO_LANDSCAPE_HEIGHT : VIDEO_PORTRAIT_HEIGHT
          }
          fps={VIDEO_FPS}
          ref={playerRef}
          controls
        />
      </div>
      <div className={layoutStyle.flow}>
        {/* This is just bad. Rather store these settings in redux and persist than passing like this */}
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
    const audio = await getChapterAudioData(DEFAULT_RECITER_ID, DEFAULT_SURAH, true);
    const defaultTimestamps = getNormalizedTimestamps(audio);

    return {
      props: {
        audio,
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
