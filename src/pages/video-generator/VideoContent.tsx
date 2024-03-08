import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
} from "remotion";
import VerseText from "@/components/Verse/VerseText";
import { getVerseWords } from "@/utils/verse";
import Translation from "@/types/Translation";
import TranslationText from "@/components/QuranReader/TranslationView/TranslationText";
import QuranTextLogo from "@/icons/quran-text-logo.svg";
import styles from "./video.module.scss";
import { useSelector } from 'react-redux';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { useCurrentFrame } from "remotion";

const getProcessedVerseWords = (verse) => {
  const currentFrame = useCurrentFrame();
  // console.log(currentFrame, verse);
  const basicWords = getVerseWords(verse);
  return basicWords;
}


const VideoContent = ({
    verses, 
    audio, 
    timestamps, 
    sceneBackground, 
    verseBackground, 
    fontColor, 
    stls,
    verseAlignment,
    translationAlignment,
    border,
    dimensions
  }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  if (border === 'false') {
    stls = {...stls, border: 'none'};
  } else {
    stls = { ...stls, border: '2px gray solid' }
  }
  // if (dimensions === 'portrait') {
  //   stls = {...stls, border: 'none'};
  // }
  
  const videoSource = 'https://static.videezy.com/system/resources/previews/000/046/143/original/Peach_Flower_Tree_2.mp4';

  return (
    <AbsoluteFill
      style={{
        backgroundColor:
          sceneBackground === ""
            ? "rgb(229,227,255)"
            : sceneBackground,
        background:
          sceneBackground === ""
            ? "linear-gradient(0deg, rgba(229,227,255,1) 0%, rgba(230,246,235,1) 50%, rgba(215,249,255,1) 100%)"
            : sceneBackground,
        justifyContent: "center",
        // opacity: opacity
      }}
    >
      <Video src={videoSource} />
      <Audio src={audio.audioUrl} />
      {verses &&
        verses.length > 0 &&
        verses.map((verse, i) => {
          return (
            <Sequence
              key={i}
              from={timestamps[i].start}
              durationInFrames={timestamps[i].durationInFrames}
            >
              <AbsoluteFill
                style={{
                  ...stls,
                  background: verseBackground,
                  color: fontColor,
                }}
              >
                {/* <Ayah data={d} /> */}
                <div style={{marginBottom: '1rem'}} className={verseAlignment === 'centre' ? styles.verseCentre : styles.verseJustified}>
                  <VerseText 
                    words={getProcessedVerseWords(verse)} 
                    shouldShowH1ForSEO={false}
                  />
                </div>
                

                {verse.translations?.map((translation: Translation) => (
                  <div key={translation.id} className={translationAlignment === 'centre' ? styles.verseTranslationCentre : styles.verseTranslationJustified}>
                    <TranslationText
                      translationFontScale={quranReaderStyles.translationFontScale}
                      text={translation.text}
                      languageId={translation.languageId}
                      resourceName={verse.translations?.length > 1 ? translation.resourceName : null}
                    />
                  </div>
                ))}
              </AbsoluteFill>
            </Sequence>
          );
        })}
      <AbsoluteFill
        style={{
          height: "100%",
          width: "100%",
          color: "rgb(0,0,0)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            right: "5%",
          }}
        >
          <QuranTextLogo />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default VideoContent;