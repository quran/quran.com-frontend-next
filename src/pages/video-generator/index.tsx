import {
  getAvailableReciters,
  getChapterAudioData,
  getChapterVerses,
} from "@/api";
import Error from "@/pages/_error";
import { getAllChaptersData } from "@/utils/chapter";
import { Player, PlayerRef } from "@remotion/player";
import classNames from "classnames";
import { GetStaticProps, NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VersesResponse } from "types/ApiResponses";
import ChaptersData from "types/ChaptersData";
import layoutStyle from "../index.module.scss";
import VideoContent from "./VideoContent";
import VideoSettings from "./VideoSettings";
import { DEFAULT_API_PARAMS, getAllBackgrounds, getNormalizedTimestamps, getStyles, getTrimmedAudio, getVideoById } from "./VideoUtils";
import styles from "./video.module.scss";

let skipFirstRender = true;
interface VideoGenerator {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  reciters: any,
  verses: any,
  audio: any,
  defaultTimestamps: any,
  chaptersData: ChaptersData;
}

const defaultOpacity = '0.2'
const defaultBackground = getAllBackgrounds(defaultOpacity)[0]

const VideoGenerator: NextPage<VideoGenerator> = ({
  hasError,
  chaptersData,
  reciters,
  verses,
  audio,
  defaultTimestamps,
}) => {
  const { t, lang } = useTranslation("common");
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const [opacity, setOpacity] = useState(defaultOpacity);
  const [sceneBackgroundColor, setSceneBackgroundColor] = useState(defaultBackground);
  const [verseBackgroundColor, setVerseBackgroundColor] = useState(defaultBackground);
  const [fontColor, setFontColor] = useState("#dddddd");
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
      perPage: chaptersData[chapter].versesCount
    }

    if (verseFrom) apiParams = { ...apiParams, from: `${chapter}:${verseFrom}` };
    if (verseTo) apiParams = { ...apiParams, to: `${chapter}:${verseTo}` };

    const fetchData = async () => {
      const verses = await getChapterVerses(
        chapter, 
        lang, 
        apiParams
      );
      const audio = await getChapterAudioData(reciter, chapter, true);
      return [verses, audio];
    };
    setIsFetching(true);
    fetchData()
      .then(([verses, audio]) => {
        seekToBeginning();
        setverseData(verses?.verses);
        const trimmedAudio = getTrimmedAudio(audio, verseFrom, verseTo);
        setAudioData(trimmedAudio);
        setTimestamps(getNormalizedTimestamps(trimmedAudio));
      })
      .catch(err => {
        console.debug('something went wrong');
      })
      .finally(() => setIsFetching(false));
  }, [reciter, selectedTranslations, searchFetch]);

  const onChapterChange = async (val) => {
    setVerseFrom('');
    setVerseTo('');
    setChapter(val);
  };

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
  
    return reciters.map((reciter) => {
      let label = reciter.translatedName.name;
      const recitationStyle = reciter.style.name;
      if (recitationStyle !== DEFAULT_RECITATION_STYLE) {
        label = `${label} - ${recitationStyle}`
      }
      return {
        id: reciter.id,
        label: label,
        value: reciter.id,
        name: reciter.name,
      }
    });
  }, [t]);

  const VideoContentComponent = () => {
    return (
      <VideoContent
        verses={verseData}
        audio={audioData}
        timestamps={timestamps}
        sceneBackground={sceneBackgroundColor?.background}
        verseBackground={verseBackgroundColor?.background}
        fontColor={fontColor}
        stls={getStyles(dimensions)}
        verseAlignment={verseAlignment}
        translationAlignment={translationAlignment}
        border={border}
        video={video}
      />
    )
  }

  const chaptersList = useMemo(() => {
    const flattenedChaptersList = Object.entries(chaptersData).map((r) => ({
      id: r[0],
      ...r[1],
    }));
    return flattenedChaptersList.map((chapter) => {
      return {
        id: chapter.id,
        label: chapter.transliteratedName,
        value: chapter.id,
        name: chapter.transliteratedName,
      };
    });
  }, [t]);

  return (
    <div className={styles.pageContainer}>
      <div className={classNames(styles.playerWrapper, layoutStyle.flowItem)}>
        <Player
          style={{ width: "100%", height: "100%" }}
          component={VideoContentComponent}
          durationInFrames={Math.ceil(
            ((audioData.duration + 500) / 1000) * 30
          )}
          compositionWidth={dimensions === 'landscape' ? 1280 : 720}
          compositionHeight={dimensions === 'landscape' ? 720 : 1280}
          fps={30}
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
    const verses = await getChapterVerses(112, locale, DEFAULT_API_PARAMS);
    const audio = await getChapterAudioData(7, 112, true);
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
