import useSWR from 'swr';
import { shallowEqual, useSelector } from 'react-redux';
import { selectChapter, selectReciter, Audio } from 'src/redux/slices/AudioPlayer/state';
import { getReciterAudio } from 'src/api';

const useAudioData = (): Audio => {
  const chapter = useSelector(selectChapter);
  const reciter = useSelector(selectReciter, shallowEqual);

  const { data: audio, error } = useSWR(`/audio/${reciter?.id}/${chapter}`, () =>
    getReciterAudio(reciter.id, chapter).then((res) => {
      if (res.status === 500) return Promise.reject(new Error(res.error));
      const firstAudio = res.audioFiles[0];
      if (!firstAudio) return Promise.reject(new Error('No audio file'));
      return {
        url: firstAudio.audioUrl,
        totalDuration: firstAudio.duration,
      };
    }),
  );

  if (error || !audio) {
    // TODO: handle error
    return {
      totalDuration: 0,
      url: '',
    };
  }

  return audio;
};

export default useAudioData;
