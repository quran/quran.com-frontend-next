import range from 'lodash/range';
import sample from 'lodash/sample';

import { AudioTrack, CuratedStation } from './types';

const QURAN_CHAPTERS_COUNT = 114;

const popularRecitersId = ['7', '3', '10', '4'];

const generatePopularRecitersAudioTracks = (): AudioTrack[] => {
  return popularRecitersId
    .map((reciter) =>
      range(1, QURAN_CHAPTERS_COUNT).map((chapter) => ({
        surah: chapter.toString(),
        reciterId: reciter.toString(),
      })),
    )
    .flat();
};

const JUZ_AMMA_FIRST_CHAPTER = 78;
const generateJuzAmmaAudioTracks = (): AudioTrack[] => {
  return popularRecitersId
    .map((reciter) =>
      range(JUZ_AMMA_FIRST_CHAPTER, QURAN_CHAPTERS_COUNT).map((chapter) => ({
        surah: chapter.toString(),
        reciterId: reciter.toString(),
      })),
    )
    .flat();
};

const generateSurahAlKahfAudioTracks = (): AudioTrack[] => {
  return popularRecitersId.map((reciterId) => ({
    surah: '18',
    reciterId,
  }));
};

const curatedStations: Record<string, CuratedStation> = {
  '1': {
    title: 'popular-recitations.title',
    description: 'popular-recitations.description',
    bannerImgSrc: '/images/stations/1.jpeg',
    audioTracks: generatePopularRecitersAudioTracks(),
  },
  '2': {
    title: 'yaseen-alwaqiah-al-mulk.title',
    description: 'yaseen-alwaqiah-al-mulk.description',
    bannerImgSrc: '/images/stations/2.jpg',
    audioTracks: [
      {
        surah: '36',
        reciterId: '7',
      },
      {
        surah: '96',
        reciterId: '7',
      },
      {
        surah: '67',
        reciterId: '7',
      },
    ],
  },
  '3': {
    title: 'surah-al-kahf.title',
    description: 'surah-al-kahf.description',
    bannerImgSrc: '/images/stations/3.jpeg',
    audioTracks: generateSurahAlKahfAudioTracks(),
  },
  '4': {
    title: 'juz-amma.title',
    description: 'juz-amma.description',
    bannerImgSrc: '/images/stations/4.jpeg',
    audioTracks: generateJuzAmmaAudioTracks(),
  },
};

export const getRandomCuratedStationId = () => {
  return sample(Object.keys(curatedStations));
};

export default curatedStations;
