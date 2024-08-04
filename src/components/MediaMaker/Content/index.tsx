/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-danger */
/* eslint-disable no-unsafe-optional-chaining */
import { useMemo, useRef } from 'react';

import classNames from 'classnames';
import { AbsoluteFill, Audio, Sequence, Video, staticFile } from 'remotion';

import styles from './MediaMakerContent.module.scss';

import ChapterIcon from '@/components/chapters/ChapterIcon';
import Alignment from '@/types/Media/Alignment';
import { Timestamp } from '@/types/Media/GenerateMediaFileRequest';
import Orientation from '@/types/Media/Orientation';
import WatermarkColor from '@/types/Media/WatermarkColor';
import { QuranFont } from '@/types/QuranReader';
import Translation from '@/types/Translation';
import Verse from '@/types/Verse';
import { convertHexToRGBA } from '@/utils/media/helpers';
import getPlainTranslationText from '@/utils/plainTranslationText';

type Props = {
  verses: Verse[];
  audio: any;
  video: any;
  timestamps: Timestamp[];
  backgroundColor: string;
  opacity: number;
  borderColor: string;
  borderSize: number;
  fontColor: string;
  verseAlignment: string;
  translationAlignment: string;
  quranTextFontScale: number;
  quranTextFontStyle: QuranFont;
  translationFontScale: number;
  orientation: Orientation;
  chapterEnglishName: string;
  isPlayer?: boolean;
};

const MediaMakerContent: React.FC<Props> = ({
  verses,
  audio,
  video,
  timestamps,
  backgroundColor,
  opacity,
  borderColor,
  borderSize,
  fontColor,
  verseAlignment,
  translationAlignment,
  quranTextFontScale,
  quranTextFontStyle,
  translationFontScale,
  orientation,
  chapterEnglishName,
  isPlayer = false,
}) => {
  const videoRef = useRef(null);
  const startFrom = useMemo(() => {
    return audio?.verseTimings[0]?.normalizedStart
      ? (audio?.verseTimings[0]?.normalizedStart / 1000) * 30
      : (audio?.verseTimings[0]?.timestampFrom / 1000) * 30;
  }, [audio?.verseTimings]);

  const endAt = useMemo(() => {
    return audio?.verseTimings[0]?.normalizedEnd
      ? (audio?.verseTimings[audio?.verseTimings?.length - 1]?.normalizedEnd / 1000) * 30
      : (audio?.verseTimings[audio?.verseTimings?.length - 1]?.timestampTo / 1000) * 30;
  }, [audio?.verseTimings]);

  const audioHasStartAndEndRanges = (!!startFrom || startFrom === 0) && !!endAt;

  const videoPath = staticFile(`${isPlayer ? '/publicMin' : ''}${video.videoSrc}`);
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
      }}
    >
      <div className={styles.videoContainer}>
        <Video ref={videoRef} src={videoPath} />
      </div>
      {audioHasStartAndEndRanges && (
        <Audio pauseWhenBuffering startFrom={startFrom} endAt={endAt} src={audio.audioUrl} />
      )}
      {verses &&
        verses.length > 0 &&
        verses.map((verse: Verse, i) => {
          return (
            <Sequence
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              from={i === 0 ? 0 : timestamps[i]?.start}
              durationInFrames={timestamps[i]?.durationInFrames}
            >
              <AbsoluteFill>
                <div className={classNames(styles.chapterTitle)}>
                  <span className={styles.surahFont}>
                    <ChapterIcon id={verse.chapterId.toString()} />
                    <ChapterIcon id="surah" />
                  </span>
                  <span
                    className={styles.surahNumber}
                  >{` - ${chapterEnglishName} (${verse.chapterId})`}</span>
                </div>
              </AbsoluteFill>
              <AbsoluteFill
                style={{
                  backgroundColor: convertHexToRGBA(backgroundColor, Number(opacity)),
                  color: fontColor,
                  // @ts-ignore
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  '--border-size': `${borderSize}px`,
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  '--border-color': borderColor,
                }}
                className={classNames(styles.verseContainer, styles.verseBorder, {
                  [styles.verseLandscape]: orientation === Orientation.LANDSCAPE,
                  [styles.versePortrait]: orientation === Orientation.PORTRAIT,
                })}
              >
                <div
                  style={{
                    fontSize: quranTextFontScale * 10.1,
                  }}
                  className={classNames(styles.verseText, {
                    [styles.verseCentre]: verseAlignment === Alignment.CENTRE,
                    [styles.verseJustified]: verseAlignment === Alignment.JUSTIFIED,
                    [styles.indopakFont]: quranTextFontStyle === QuranFont.IndoPak,
                  })}
                >
                  {verse.words
                    .map((word) =>
                      quranTextFontStyle === QuranFont.QPCHafs
                        ? word.qpcUthmaniHafs
                        : word.textIndopak,
                    )
                    .join(' ')}
                </div>

                {verse.translations?.map((translation: Translation) => (
                  <div
                    key={translation.id}
                    className={classNames(styles.translation, {
                      [styles.verseTranslationCentre]: translationAlignment === Alignment.CENTRE,
                      [styles.verseTranslationJustified]:
                        translationAlignment === Alignment.JUSTIFIED,
                    })}
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
        <div className={classNames(styles.watermark)}>
          <div>
            I made this on
            <span className={styles.logo}> Quran.com</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MediaMakerContent;
