import range from 'lodash/range';

import { AudioTrack, CuratedStation } from './types';

import { QURAN_CHAPTERS_COUNT } from 'src/utils/chapter';

const popularRecitersId = ['7', '3', '10', '4'];

const generatePopularRecitersAudioTracks = (): AudioTrack[] => {
  return popularRecitersId
    .map((reciter) =>
      range(1, QURAN_CHAPTERS_COUNT).map((chapter) => ({
        chapterId: chapter.toString(),
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
        chapterId: chapter.toString(),
        reciterId: reciter.toString(),
      })),
    )
    .flat();
};

const curatedStations: Record<string, CuratedStation> = {
  popular: {
    title: 'popular-recitations',
    description: 'popular-recitations',
    bannerImgSrc: '/images/stations/1.jpeg',
    audioTracks: generatePopularRecitersAudioTracks(),
  },
  '2': {
    title: 'yaseen-alwaqiah-al-mulk',
    description: 'yaseen-alwaqiah-al-mulk',
    bannerImgSrc: '/images/stations/1.jpeg',
    audioTracks: [
      {
        chapterId: '36',
        reciterId: '7',
      },
      {
        chapterId: '96',
        reciterId: '7',
      },
      {
        chapterId: '67',
        reciterId: '7',
      },
    ],
  },
  '3': {
    title: 'surah-al-kahf',
    description: 'surah-al-kahf',
    bannerImgSrc: '/images/stations/3.svg',
    audioTracks: popularRecitersId.map((reciterId) => ({
      chapterId: '18',
      reciterId,
    })),
  },
  '4': {
    title: 'juz-amma',
    description: 'juz-amma',
    bannerImgSrc: '/images/stations/3.svg',
    audioTracks: generateJuzAmmaAudioTracks(),
  },
};

export default curatedStations;
