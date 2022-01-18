import { CuratedStation } from './types';

const curatedStations: Record<string, CuratedStation> = {
  '1': {
    title: 'Ar-Rahman, Al-Waqiah, Yaseen',
    description: 'Mishary Al-fasy, and others',
    bannerImgSrc:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEmUbwwLCH95IjmlwCU0gpxtNPkK-qbV1Pkg&usqp=CAU',
    audioItems: [
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
    bannerImgSrc:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEmUbwwLCH95IjmlwCU0gpxtNPkK-qbV1Pkg&usqp=CAU',
    audioItems: [
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
    bannerImgSrc: 'https://salattimes.com/wp-content/uploads/2020/10/018.svg',
    audioItems: [
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
