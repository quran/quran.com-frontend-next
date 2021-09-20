import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import {
  HighlightStatusState,
  setHighlightStatus,
} from 'src/redux/slices/QuranReader/highlightStatus';

const AudioTimestampsHighlightListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const updateHighlightStatus = () => {
      dispatch(setHighlightStatus(getHighlightStatus(window.audioPlayerEl.currentTime, [])));
    };

    window.audioPlayerEl.addEventListener('timeupdate', updateHighlightStatus);

    return () => {
      window.audioPlayerEl.removeEventListener('timeupdate', updateHighlightStatus);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const getHighlightStatus = (currentTime: number, verseTimestamps: any[]): HighlightStatusState => {
  console.log(currentTime, verseTimestamps);
  // dummy data
  return {
    chapter: 1,
    verse: 2,
    word: 3,
  };
};

export default AudioTimestampsHighlightListener;
