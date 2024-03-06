import { Player, PlayerRef } from "@remotion/player";
import { GetStaticProps, NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import layoutStyle from "../index.module.scss";
import Error from "@/pages/_error";
import styles from "./video.module.scss";
import classNames from "classnames";
import {
  getAvailableReciters,
  getChapterAudioData,
  getChapterVerses,
} from "@/api";
import { getAllChaptersData } from "@/utils/chapter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VersesResponse } from "types/ApiResponses";
import ChaptersData from "types/ChaptersData";
import VideoContent from "./VideoContent";
import VideoSettings from "./VideoSettings";
import { DEFAULT_API_PARAMS, getAllBackgrounds, getNormalizedTimestamps, getStyles } from "./VideoUtils";

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
const defaultBackground = getAllBackgrounds('1')[0]

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

  const [opacity, setOpacity] = useState('1');
  const [sceneBackgroundColor, setSceneBackgroundColor] = useState(defaultBackground);
  const [verseBackgroundColor, setVerseBackgroundColor] = useState(defaultBackground);
  const [fontColor, setFontColor] = useState("#071a1c");
  const [reciter, setReciter] = useState(1);
  const [chapter, setChapter] = useState(112);
  const [verseData, setverseData] = useState(verses?.verses);
  const [audioData, setAudioData] = useState(audio);
  const [timestamps, setTimestamps] = useState(defaultTimestamps);
  const [selectedTranslations, setSelectedTranslations] = useState([131]);
  const [verseAlignment, setVerseAlignment] = useState('centre');
  const [translationAlignment, setTranslationAlignment] = useState('centre');
  const [border, setBorder] = useState('true');
  const [dimensions, setDimensions] = useState('landscape');

  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (skipFirstRender) {
      skipFirstRender = false;
      setTimestamps(getNormalizedTimestamps(audioData));
      return;
    }
    const fetchData = async () => {
      const verses = await getChapterVerses(chapter, 'en', {...DEFAULT_API_PARAMS, translations: selectedTranslations, perPage: chaptersData[chapter].versesCount} );
      const audio = await getChapterAudioData(reciter, chapter, true);
      return [verses, audio];
    };
    fetchData().then(([verses, audio]) => {
      seekToBeginning();
      setverseData(verses?.verses);
      setAudioData(audio);
      setTimestamps(getNormalizedTimestamps(audio));
    });
  }, [reciter, chapter, selectedTranslations]);

  const onChapterChange = async (val) => {
    setChapter(val);
  };

  const seekToBeginning = useCallback(() => {
    const { current } = playerRef;
    if (!current) {
      return;
    }
    current.pause();
    current.seekTo(0);
  }, []);

  const recitersOptions = useMemo(() => {
    return reciters.map((reciter) => ({
      id: reciter.id,
      label: reciter.name,
      value: reciter.reciterId,
      name: reciter.name,
    }));
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
        dimensions={dimensions}
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
        {/* This is just horrible. Rather store these settings in redux and persist than passing like this */}
        <VideoSettings
          chaptersList={chaptersList}
          chapter={chapter}
          onChapterChange={onChapterChange}
          recitersOptions={recitersOptions}
          reciter={reciter}
          setReciter={setReciter}
          sceneBackgroundColor={sceneBackgroundColor}
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
        />
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters } = await getAvailableReciters(locale, []);
    const chaptersData = await getAllChaptersData(locale);
    const verses = await getChapterVerses(112, 'en', DEFAULT_API_PARAMS);
    const audio = await getChapterAudioData(1, 112, true);
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
