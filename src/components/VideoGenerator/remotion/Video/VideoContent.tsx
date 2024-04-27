/* eslint-disable no-unsafe-optional-chaining */
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { AbsoluteFill, Audio, Sequence, Video } from 'remotion';

import styles from './video.module.scss';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Translation from '@/types/Translation';
import { getVerseWords } from '@/utils/verse';
import { WatermarkColor } from '@/utils/videoGenerator/constants';

let style = {};

type Props = {
  verses: any;
  audio: any;
  video: any;
  timestamps: any;
  sceneBackground: string;
  verseBackground: string;
  fontColor: string;
  stls: any;
  verseAlignment: string;
  translationAlignment: string;
  border: string;
};

const VideoContent: React.FC<Props> = ({
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
        <Video pauseWhenBuffering loop src={video.videoSrc} />
      </div>
      <Audio
        pauseWhenBuffering
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
                  className={
                    verseAlignment === 'centre' ? styles.verseCentre : styles.verseJustified
                  }
                >
                  <VerseText words={getVerseWords(verse)} shouldShowH1ForSEO={false} />
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
      <AbsoluteFill>
        <div
          className={classNames(styles.watermark, {
            [styles.watermarkDark]: video.watermarkColor === WatermarkColor.DARK,
            [styles.watermarkLight]: video.watermarkColor === WatermarkColor.LIGHT,
          })}
        >
          Quran.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default VideoContent;
