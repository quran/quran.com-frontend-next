import {
  AbsoluteFill,
  Audio,
  Sequence,
} from "remotion";
import VerseText from "@/components/Verse/VerseText";
import { getVerseWords } from "@/utils/verse";
import Translation from "@/types/Translation";
import TranslationText from "@/components/QuranReader/TranslationView/TranslationText";
import QuranTextLogo from "@/icons/quran-text-logo.svg";
import styles from "./video.module.scss";
import { useSelector } from 'react-redux';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';


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
    opacity
  }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

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
                    words={getVerseWords(verse)} 
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