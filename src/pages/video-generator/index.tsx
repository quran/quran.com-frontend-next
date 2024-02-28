import { AbsoluteFill, Audio, interpolate, useCurrentFrame, Sequence, Video as RVideo } from "remotion"
import { surahs } from './constants/surahs'
import { audios } from './constants/audios';
import { Player } from "@remotion/player";
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import Error from '@/pages/_error';
import layoutStyle from '../index.module.scss';
import styles from './video.module.scss';

import { getJuzNavigationUrl } from '@/utils/navigation';
import classNames from 'classnames';

import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import QuranFontSection from './QuranFontSectionSetting';
import ReciterSectionSetting from './ReciterSectionSetting';

interface VideoGenerator {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const Title: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
 
  return (
    <div style={{ opacity, textAlign: "center", fontSize: "7em" }}>{title}</div>
  );
};

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Title title="Hello World" />
    </AbsoluteFill>
  );
};

export const SURAH = 112
export const VIDEO_ORIENTATION = 'LANDSCAPE'
const verseData = getVersesForSurah(SURAH);
const timestamps = getNormalizedTimestamps(getVersesForSurah(SURAH));


function getVersesForSurah(id) {
  return surahs[id].verses;
}
function getSurahDuration(surah) {
  surah = audios[surah];
  return surah.audio_files[0].duration;
}

function getNormalizedIntervals(start, end) {
  const FRAMES = 30;
  const normalizedStart = start / 1000 * FRAMES
  const normalizedEnd = end / 1000 * FRAMES
  const durationInFrames = normalizedEnd - normalizedStart;

  return {
    start: normalizedStart,
    end: normalizedEnd,
    durationInFrames: durationInFrames
  }
}


function getNormalizedTimestamps(verses) {
  console.log('verses', verses);
  let result = [];
  for (let i = 0; i < verses.length; i++) {
    const currentVerse = verses[i];
    const nextVerse = verses[i + 1] || undefined;
    let start = 0;
    let end = 0;
    if (i === 0) {
      start = 0;
      if (nextVerse) {
        end = nextVerse.timestamps.timestamp_from;
      }
    } else if (i === verses.length - 1) {
      start = currentVerse.timestamps.timestamp_from;
      end = getSurahDuration(SURAH);
    } else if (nextVerse) {
      start = currentVerse.timestamps.timestamp_from;
      end = nextVerse.timestamps.timestamp_from;
    }

    result.push(getNormalizedIntervals(start, end))
  }
  return result;
}

const Ayah = ({ data }) => {
  return (
    <div className="verseContainer">
      <div className="verse">
        <div className="text">
          {data.text_uthmani}
        </div>
        <div className="number">
          {data.verse_number}
        </div>
      </div>
      {data.translations.map((t: any, i) =>
      (
        <div className="translation" key={i}>
          <div className="translationText">
            {t.text}
          </div>
        </div>
      ))}
    </div>
  )

}
function getAudioURL(surah) {
  return audios[surah].audio_files[0].audio_url;
}

function getVideoURL(surah) {
  const staticVideos = [
    'https://static.videezy.com/system/resources/previews/000/046/939/original/waterfall_and_flowers.mp4',
    'https://static.videezy.com/system/resources/previews/000/046/143/original/Peach_Flower_Tree_2.mp4',
    'https://static.videezy.com/system/resources/previews/000/035/955/original/4k-2018.12.02-SUNSET-LIGHT-ADJUST.mp4'
  ]
  return  staticVideos[Math.floor(Math.random() * staticVideos.length)]
}
function getBackground() {
  const styles = {
    justifyContent: 'center',
    color: '#111',
    width: VIDEO_ORIENTATION === 'LANDSCAPE' ? '70%' : '85%',
    height: VIDEO_ORIENTATION === 'LANDSCAPE' ? '70%' : '50%',
    margin: 'auto',
    border: '2px gray solid',
    borderRadius: '20px',
    alignItems: 'center'
  }
  const backgrounds = [
    {
      backgroundColor: 'rgb(229,227,255)',
      background: 'linear-gradient(0deg, rgba(229,227,255,1) 0%, rgba(230,246,235,1) 50%, rgba(215,249,255,1) 100%)',
    },
    {
      backgroundColor: 'rgb(244,255,227)',
      background: 'linear-gradient(0deg, rgba(244,255,227,1) 0%, rgba(255,229,215,1) 100%)'
    }, 
    {
      backgroundColor: 'rgb(202,166,255)',
      background: 'linear-gradient(330deg, rgba(202,166,255,1) 0%, rgba(152,255,148,1) 100%)'
    }
  ]
  return {
    ...styles,
    ...backgrounds[Math.floor(Math.random() * backgrounds.length)]
  }
}

const audio = getAudioURL(SURAH)
const video = getVideoURL(SURAH);
const stls = getBackground();


const MyVideoo = () => {
  return (
    <AbsoluteFill style={{
      backgroundColor: 'rgb(229,227,255)',
      background: 'linear-gradient(0deg, rgba(229,227,255,1) 0%, rgba(230,246,235,1) 50%, rgba(215,249,255,1) 100%)',
      justifyContent: 'center'
    }}>
      {/* <RVideo loop src={video} /> */}
      <Audio placeholder="surah kawthar" src={audio} />
      {verseData && verseData.length > 0 && verseData.map((d, i) => {
        return (
          <Sequence key={i} from={timestamps[i].start} durationInFrames={timestamps[i].durationInFrames}>
            <AbsoluteFill
              style={stls}
            >
              <Ayah data={d} />
            </AbsoluteFill>
          </Sequence>
        )
      }

      )}
    </AbsoluteFill>
  )
}

const VideoGenerator: NextPage<VideoGenerator> = ({ hasError, juzVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { juzId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }

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
            component={MyVideoo}
            durationInFrames={(audios[SURAH].audio_files[0].duration / 1000) * 30}
            compositionWidth={1280}
            compositionHeight={720}
            fps={30}
            autoPlay
            loop
            controls
          />
        </div>
        <div className={layoutStyle.flow}>
          <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.settingsContainer)}>
            <div>
              <QuranFontSection />
            </div>
            <div>
              <ReciterSectionSetting />
            </div>
            <div>
              <QuranFontSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoGenerator;