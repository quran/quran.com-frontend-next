import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { TOTAL_QURAN_CHAPTERS } from 'src/utils/chapter';
import AudioData from 'types/AudioData';

// If the audio for the current surah ended, and we're not in repeat mode
// Play the next surah
const usePlayNextSurah = (
  isAudioEnded: boolean,
  isInRepeatMode: boolean,
  audioData: AudioData,
  reciterId: number,
) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isAudioEnded && !isInRepeatMode) {
      const currentChapterId = audioData?.chapterId;
      if (!currentChapterId) return null;
      const nextChapterId = currentChapterId + 1;
      if (nextChapterId <= TOTAL_QURAN_CHAPTERS) {
        dispatch(
          playFrom({
            chapterId: nextChapterId,
            reciterId,
            timestamp: 0,
          }),
        );
      }
    }

    return null;
  }, [audioData?.chapterId, dispatch, isAudioEnded, isInRepeatMode, reciterId]);
};

export default usePlayNextSurah;
