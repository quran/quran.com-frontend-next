import { CuratedStation } from './types';

// TODO: localize title & description?
const curatedStations: Record<string, CuratedStation> = {
  '1': {
    title: 'Ar-Rahman, Al-Waqiah, Yaseen',
    description: 'Mishary Al-fasy, and others',
    bannerImgSrc: '/images/stations/1.jpeg',
    audioTracks: [
      {
        chapterId: '55',
        reciterId: '7',
      },
      {
        chapterId: '56',
        reciterId: '7',
      },
      {
        chapterId: '49',
        reciterId: '7',
      },
    ],
  },
  '2': {
    title: 'Classic Recitations',
    description: 'Abu Bakr al-Shatri',
    bannerImgSrc: '/images/stations/1.jpeg',
    audioTracks: [
      {
        chapterId: '33',
        reciterId: '4',
      },
      {
        chapterId: '35',
        reciterId: '4',
      },
    ],
  },
  '3': {
    title: 'Friday Night Recitations',
    description: 'Mishary Al-fasy & Abu Bakr al-Shatri',
    bannerImgSrc: '/images/stations/3.svg',
    audioTracks: [
      {
        chapterId: '36',
        reciterId: '7',
      },
      {
        chapterId: '18',
        reciterId: '4',
      },
    ],
  },
};

export default curatedStations;
