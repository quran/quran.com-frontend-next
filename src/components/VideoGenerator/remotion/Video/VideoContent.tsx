/* eslint-disable react/no-danger */
/* eslint-disable no-unsafe-optional-chaining */
import classNames from 'classnames';
import { AbsoluteFill, Audio, Sequence, Video } from 'remotion';

import styles from './video.module.scss';

import ChapterIcon from '@/components/chapters/ChapterIcon';
import { getBackgroundWithOpacityById } from '@/components/VideoGenerator/VideoUtils';
import Translation from '@/types/Translation';
import getPlainTranslationText from '@/utils/plainTranslationText';
import { getVerseWords } from '@/utils/verse';
import { Alignment, Orientation, WatermarkColor } from '@/utils/videoGenerator/constants';

let style = {};

type Props = {
  verses: any;
  audio: any;
  video: any;
  timestamps: any;
  backgroundColorId: number;
  opacity: string;
  fontColor: string;
  stls: any;
  verseAlignment: string;
  translationAlignment: string;
  quranTextFontScale: number;
  translationFontScale: number;
  shouldHaveBorder: string;
  orientation: Orientation;
};

const VideoContent: React.FC<Props> = ({
  verses,
  audio,
  video,
  timestamps,
  backgroundColorId,
  opacity,
  fontColor,
  stls,
  verseAlignment,
  translationAlignment,
  shouldHaveBorder,
  quranTextFontScale,
  translationFontScale,
}) => {
  if (shouldHaveBorder === 'false') {
    style = { ...stls, border: 'none' };
  } else {
    style = { ...stls, border: '2px gray solid' };
  }

  return (
    <AbsoluteFill
      style={{
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
              from={i === 0 ? 0 : timestamps[i]?.start}
              durationInFrames={timestamps[i]?.durationInFrames}
            >
              <AbsoluteFill>
                <div
                  className={classNames(styles.chapterTitle, {
                    [styles.watermarkDark]: video.watermarkColor === WatermarkColor.DARK,
                    [styles.watermarkLight]: video.watermarkColor === WatermarkColor.LIGHT,
                  })}
                >
                  <ChapterIcon id={verse.chapterId.toString()} />
                  <ChapterIcon id="surah" />
                </div>
              </AbsoluteFill>
              <AbsoluteFill
                style={{
                  ...style,
                  background: getBackgroundWithOpacityById(backgroundColorId, opacity).background,
                  color: fontColor,
                }}
              >
                <div
                  style={{
                    fontFamily: 'UthmanicHafs',
                    direction: 'rtl',
                    marginBlock: '3px',
                    fontSize: quranTextFontScale * 10.1,
                  }}
                  className={
                    verseAlignment === Alignment.CENTRE ? styles.verseCentre : styles.verseJustified
                  }
                >
                  {getVerseWords(verse)
                    .map((word) => word.qpcUthmaniHafs)
                    .join(' ')}
                </div>

                {verse.translations?.map((translation: Translation) => (
                  <div
                    key={translation.id}
                    className={
                      translationAlignment === Alignment.CENTRE
                        ? styles.verseTranslationCentre
                        : styles.verseTranslationJustified
                    }
                  >
                    <div
                      style={{ fontSize: translationFontScale * 10.1 }}
                      dangerouslySetInnerHTML={{
                        __html: getPlainTranslationText(translation.text),
                      }}
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
          // eslint-disable-next-line i18next/no-literal-string
        >
          Quran.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default VideoContent;
