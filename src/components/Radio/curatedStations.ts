import { CuratedStation } from './types';

const curatedStations: Record<string, CuratedStation> = {
  '1': {
    title: 'Ar-Rahman, Al-Waqiah, Yaseen',
    description: 'Mishary Al-fasy, and others',
    audioItems: [
      {
        chapterId: '1',
        reciterId: '3',
      },
      {
        chapterId: '3',
        reciterId: '10',
      },
      {
        chapterId: '55',
        reciterId: '10',
      },
    ],
  },
  '2': {
    title: 'aaww',
    description: 'wwowo',
    audioItems: [
      {
        chapterId: '1',
        reciterId: '3',
      },
    ],
  },
  '3': {
    title: 'aaww',
    description: 'wwowo',
    audioItems: [
      {
        chapterId: '1',
        reciterId: '3',
      },
    ],
  },
};

export default curatedStations;
