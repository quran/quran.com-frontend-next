import { Player, PlayerRef } from "@remotion/player";
import { GetStaticProps, NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import layoutStyle from "../index.module.scss";

import Error from "@/pages/_error";
import styles from "./video.module.scss";

import { getJuzNavigationUrl } from "@/utils/navigation";
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
import { DEFAULT_API_PARAMS, getNormalizedTimestamps, stls } from "./VideoUtils";

/**                    Discussion 1
 + Discussion around how the UI will look like for end users
 + Adding options to customize videos. Reciter, Translation, Translation source, Font type, range of ayahs, text alignment
 + Ability to change ayah background color, transparency, size. Ability to change stock background videos
 - We have to be cognizant of the video size.
 - Think more about the workflow. Is there an option to share it directly to some apps. Or do we let the user download and upload it themselves.
 - Talal: For this point, I feel like for adding to e.g. instagram stories, whatsapp status etc. It would be better if the user has it in their library. But for other platforms like sharing on twitter, fb, would've been easier if it was something like sharing from a youtube/dailymotion kind of platform, where u just paste the link and it "just works"
 + Add watermark and the ability to customize locations
 - Investigate how we will be dealing with long ayahs, including with translations. Do we split them into multiple scenes, adjust relative font size based on number of characters etc.
 - Templates for users to select from and try their range of ayahs
 + Preview editor. The changes that users make, how they will appear in the UI. Real-time updates of their changes? just a still frame with their changes all in one place (easier)? ability to play pause etc. Perhaps if the remotion studio editor could be embedded somehow
 */

// limits of renders? requires auth? any way to cache similar videos? disabling multiple renders?

/**                    Discussion 2
 * try older remotion version (latest that works with react 17)
 * try QFC font, its good wiht all pages
 * should be able to reuse some bits
 * segments
 * settings will be independent
 * video domain can be whitelisted in next.config
 */

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
// TODO: FIXME:
function setOpacity(bg, opct) {

}

const VideoGenerator: NextPage<VideoGenerator> = ({
  hasError,
  chaptersData,
  reciters,
  verses,
  audio,
  defaultTimestamps,
}) => {
  const { t, lang } = useTranslation("common");
  const {
    query: { juzId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const [sceneBackgroundColor, setSceneBackgroundColor] = useState("");
  const [opacity, setOpacity] = useState('1');
  const [verseBackgroundColor, setVerseBackgroundColor] = useState(`rgba(216, 249, 253, ${opacity})`);
  const [fontColor, setFontColor] = useState("#071a1c");
  const [reciter, setReciter] = useState(1);
  const [chapter, setChapter] = useState(112);
  const [verseData, setverseData] = useState(verses?.verses);
  const [audioData, setAudioData] = useState(audio);
  const [timestamps, setTimestamps] = useState(defaultTimestamps);
  const [selectedTranslations, setSelectedTranslations] = useState([131]);
  const [verseAlignment, setVerseAlignment] = useState('centre');
  const [translationAlignment, setTranslationAlignment] = useState('centre');
  console.log('verseBackgroundColor', verseBackgroundColor);


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
        sceneBackground={sceneBackgroundColor}
        verseBackground={verseBackgroundColor}
        fontColor={fontColor}
        stls={stls}
        verseAlignment={verseAlignment}
        translationAlignment={translationAlignment}
        opacity={opacity}
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
  const path = getJuzNavigationUrl(Number(juzId));
  return (
    <>
      {/* <NextSeoWrapper
        title={`${t('juz')} ${toLocalizedNumber(Number(juzId), lang)}`}
        description={getPageOrJuzMetaDescription(juzVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      /> */}
      <div className={styles.pageContainer}>
        <div className={classNames(styles.playerWrapper, layoutStyle.flowItem)}>
          <Player
            component={VideoContentComponent}
            durationInFrames={Math.ceil(
              ((audioData.duration + 500) / 1000) * 30
            )}
            compositionWidth={1280}
            compositionHeight={720}
            fps={30}
            ref={playerRef}
            // autoPlay
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
