/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-danger */
/* eslint-disable no-unsafe-optional-chaining */
import { useEffect, useState } from 'react';

import classNames from 'classnames';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  continueRender,
  delayRender,
  prefetch,
  staticFile,
} from 'remotion';

import styles from './MediaMakerContent.module.scss';

import ChapterIcon from '@/components/chapters/ChapterIcon';
import Alignment from '@/types/Media/Alignment';
import Orientation from '@/types/Media/Orientation';
import WatermarkColor from '@/types/Media/WatermarkColor';
import Translation from '@/types/Translation';
import Verse from '@/types/Verse';
import { getBackgroundWithOpacityById } from '@/utils/media/utils';
import getPlainTranslationText from '@/utils/plainTranslationText';

type Props = {
  verses: Verse[];
  audio: any;
  video: any;
  timestamps: any;
  backgroundColorId: number;
  opacity: string;
  fontColor: string;
  verseAlignment: string;
  translationAlignment: string;
  quranTextFontScale: number;
  translationFontScale: number;
  shouldHaveBorder: string;
  orientation: Orientation;
  chapterEnglishName: string;
  isPlayer?: boolean;
};

const MediaMakerContent: React.FC<Props> = ({
  verses,
  audio,
  video,
  timestamps,
  backgroundColorId,
  opacity,
  fontColor,
  verseAlignment,
  translationAlignment,
  shouldHaveBorder,
  quranTextFontScale,
  translationFontScale,
  orientation,
  chapterEnglishName,
  isPlayer = false,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [handle] = useState(() => delayRender());
  const startFrom = audio?.verseTimings[0]?.normalizedStart
    ? (audio?.verseTimings[0]?.normalizedStart / 1000) * 30
    : (audio?.verseTimings[0]?.timestampFrom / 1000) * 30;
  const endAt = audio?.verseTimings[0]?.normalizedEnd
    ? (audio?.verseTimings[audio?.verseTimings?.length - 1]?.normalizedEnd / 1000) * 30
    : (audio?.verseTimings[audio?.verseTimings?.length - 1]?.timestampTo / 1000) * 30;
  const audioHasStartAndEndRanges = (!!startFrom || startFrom === 0) && !!endAt;

  const videoPath = staticFile(`${isPlayer ? '/publicMin' : ''}${video.videoSrc}`);

  useEffect(() => {
    const { waitUntilDone: waitUntilVideoDone, free: freeVideo } = prefetch(videoPath, {
      method: 'blob-url',
    });
    const { waitUntilDone: waitUntilAudioDone, free: freeAudio } = prefetch(audio.audioUrl, {
      method: 'blob-url',
    });
    waitUntilVideoDone()
      .then(() => {
        waitUntilAudioDone()
          .then(() => {
            setIsReady(true);
            continueRender(handle);
          })
          .catch((error) => {
            console.log('audio', error);
          });
      })
      .catch((error) => {
        console.log('video', error);
      });
    return () => {
      freeVideo();
      freeAudio();
    };
  }, [audio.audioUrl, handle, video.videoSrc, videoPath]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
      }}
    >
      <div className={styles.videoContainer}>
        {isReady && <Video pauseWhenBuffering src={videoPath} />}
      </div>
      {isReady && audioHasStartAndEndRanges && (
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
                <div
                  className={classNames(styles.chapterTitle, {
                    [styles.watermarkDark]: video.watermarkColor === WatermarkColor.DARK,
                    [styles.watermarkLight]: video.watermarkColor === WatermarkColor.LIGHT,
                  })}
                >
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
                  background: getBackgroundWithOpacityById(backgroundColorId, opacity).background,
                  color: fontColor,
                }}
                className={classNames(styles.verseContainer, {
                  [styles.verseBorder]: shouldHaveBorder === 'true',
                  [styles.verseNoBorder]: shouldHaveBorder === 'false',
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
                  })}
                >
                  {verse.words.map((word) => word.qpcUthmaniHafs).join(' ')}
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
        <div
          className={classNames(styles.watermark, {
            [styles.watermarkDark]: video.watermarkColor === WatermarkColor.DARK,
            [styles.watermarkLight]: video.watermarkColor === WatermarkColor.LIGHT,
          })}
        >
          <div>I made this on</div>
          <div className={styles.logo}>Quran.com</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MediaMakerContent;
