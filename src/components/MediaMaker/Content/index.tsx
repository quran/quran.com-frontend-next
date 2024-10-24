/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-danger */
/* eslint-disable no-unsafe-optional-chaining */
import { useMemo } from 'react';

import classNames from 'classnames';
import { AbsoluteFill, Audio, Sequence, Video, staticFile } from 'remotion';

import styles from './MediaMakerContent.module.scss';

import useGetChaptersData from '@/hooks/useGetChaptersData';
import Alignment from '@/types/Media/Alignment';
import { Timestamp } from '@/types/Media/GenerateMediaFileRequest';
import Orientation from '@/types/Media/Orientation';
import { QuranFont } from '@/types/QuranReader';
import Translation from '@/types/Translation';
import Verse from '@/types/Verse';
import { getChapterData } from '@/utils/chapter';
import defaultChaptersData from '@/utils/media/defaultChaptersData.json';
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

const WORD_SURAH = 'سُورَة';
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
  const chaptersDataArabic = useGetChaptersData('ar');
  const firstVerseTiming = audio?.verseTimings[0];

  const startFrom = useMemo(() => {
    const normalizedStart = firstVerseTiming?.normalizedStart;

    return normalizedStart
      ? (normalizedStart / 1000) * 30
      : (firstVerseTiming?.timestampFrom / 1000) * 30;
  }, [firstVerseTiming?.normalizedStart, firstVerseTiming?.timestampFrom]);

  const endAt = useMemo(() => {
    const verseTiming = audio?.verseTimings[audio?.verseTimings?.length - 1];

    return firstVerseTiming?.normalizedEnd
      ? (verseTiming?.normalizedEnd / 1000) * 30
      : (verseTiming?.timestampTo / 1000) * 30;
  }, [audio?.verseTimings, firstVerseTiming?.normalizedEnd]);

  const audioHasStartAndEndRanges = typeof startFrom === 'number' && typeof endAt === 'number';

  const videoPath = staticFile(`${isPlayer ? '/publicMin' : ''}${video.videoSrc}`);
  const isPortrait = orientation === Orientation.PORTRAIT;
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
      }}
      translate="no"
    >
      <div className={styles.videoContainer}>
        <Video loop src={videoPath} />
      </div>
      {audioHasStartAndEndRanges && (
        <Audio
          pauseWhenBuffering
          startFrom={startFrom}
          endAt={endAt}
          src={audio.audioUrl}
          acceptableTimeShiftInSeconds={1}
        />
      )}
      {verses &&
        verses.length > 0 &&
        verses.map((verse: Verse, i) => {
          const chapter = getChapterData(
            chaptersDataArabic || (JSON.parse(JSON.stringify(defaultChaptersData)) as any),
            String(verse.chapterId),
          );

          return (
            <Sequence
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              from={i === 0 ? 0 : timestamps[i]?.start}
              durationInFrames={timestamps[i]?.durationInFrames}
            >
              <AbsoluteFill
                style={{
                  height: '250px',
                  paddingTop: isPortrait ? 90 : 40,
                  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))',
                }}
              >
                <div className={styles.chapterTitle}>
                  <div>
                    <span
                      className={classNames(styles.watermark, {
                        [styles.watermarkPortrait]: isPortrait,
                        [styles.watermarkLandscape]: !isPortrait,
                      })}
                    >
                      I made this on
                    </span>
                    <span className={styles.space} />
                    <span
                      className={classNames(styles.logo, {
                        [styles.logoPortrait]: isPortrait,
                        [styles.logoLandscape]: !isPortrait,
                      })}
                    >
                      Quran.com
                    </span>
                  </div>
                  <div>
                    <span
                      className={styles.surahArabic}
                    >{`${WORD_SURAH} ${chapter?.translatedName}`}</span>
                    <span className={styles.surahEnglish}>
                      {` - ${chapterEnglishName} (Ch. ${verse.chapterId})`}
                    </span>
                  </div>
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
                  [styles.verseLandscape]: !isPortrait,
                  [styles.versePortrait]: isPortrait,
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
                    [styles.uthmaniFont]: quranTextFontStyle === QuranFont.QPCHafs,
                  })}
                >
                  {verse.words.map((word) => word.text).join(' ')}
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
                        __html: getPlainTranslationText(
                          `${translation.text} (${verse.chapterId}:${verse.verseNumber})`,
                        ),
                      }}
                    />
                  </div>
                ))}
              </AbsoluteFill>
            </Sequence>
          );
        })}
    </AbsoluteFill>
  );
};

export default MediaMakerContent;
