/* eslint-disable no-unsafe-optional-chaining */
import { useSelector } from 'react-redux';
import { AbsoluteFill, Audio, Sequence, Video } from 'remotion';

import styles from './video.module.scss';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import QuranTextLogo from '@/icons/quran-text-logo.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Translation from '@/types/Translation';
import { getVerseWords } from '@/utils/verse';

const getProcessedVerseWords = (verse) => {
  const basicWords = getVerseWords(verse);
  return basicWords;
};

let style = {};

// eslint-disable-next-line import/prefer-default-export
export const VideoContent = ({
  verses,
  audio,
  video,
  timestamps,
  sceneBackground,
  verseBackground,
  fontColor,
  stls,
  verseAlignment,
  translationAlignment,
  border,
}) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  if (border === 'false') {
    style = { ...stls, border: 'none' };
  } else {
    style = { ...stls, border: '2px gray solid' };
  }

  return (
    <AbsoluteFill
      style={{
        background: sceneBackground,
        justifyContent: 'center',
      }}
    >
      <div className={styles.videoContainer}>
        <Video loop src={video.videoSrc} />
      </div>
      <Audio
        startFrom={
          audio?.verseTimings[0]?.normalizedStart
            ? (audio?.verseTimings[0]?.normalizedStart / 1000) * 30
            : (audio?.verseTimings[0]?.timestampFrom / 1000) * 30
        }
        endAt={
          audio?.verseTimings[0]?.normalizedEnd
            ? (audio.verseTimings[audio.verseTimings.length - 1].normalizedEnd / 1000) * 30
            : (audio.verseTimings[audio.verseTimings.length - 1].timestampTo / 1000) * 30
        }
        src={audio.audioUrl}
      />
      {verses &&
        verses.length > 0 &&
        verses.map((verse, i) => {
          return (
            <Sequence
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              from={i === 0 ? 0 : timestamps[i].start}
              durationInFrames={timestamps[i].durationInFrames}
            >
              <AbsoluteFill
                style={{
                  ...style,
                  background: verseBackground,
                  color: fontColor,
                }}
              >
                <div
                  style={{ marginBottom: '1rem' }}
                  className={
                    verseAlignment === 'centre' ? styles.verseCentre : styles.verseJustified
                  }
                >
                  <VerseText words={getProcessedVerseWords(verse)} shouldShowH1ForSEO={false} />
                </div>

                {verse.translations?.map((translation: Translation) => (
                  <div
                    key={translation.id}
                    className={
                      translationAlignment === 'centre'
                        ? styles.verseTranslationCentre
                        : styles.verseTranslationJustified
                    }
                  >
                    <TranslationText
                      translationFontScale={quranReaderStyles.translationFontScale}
                      text={translation.text}
                      languageId={translation.languageId}
                      resourceName={
                        verse.translations?.length > 1 ? translation.resourceName : null
                      }
                    />
                  </div>
                ))}
              </AbsoluteFill>
            </Sequence>
          );
        })}
      <AbsoluteFill
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <div
          className={video.watermarkColor === 'dark' ? styles.watermarkDark : styles.watermarkLight}
          style={{
            position: 'absolute',
            bottom: '6%',
            right: '5%',
          }}
        >
          <QuranTextLogo />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
