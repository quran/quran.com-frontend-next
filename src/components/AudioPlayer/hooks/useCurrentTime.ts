import { useEffect, useState } from 'react';

const useAudioPlayerCurrentTime = (audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>) => {
  const [currentTime, setCurrentTime] = useState(0); // TODO: get current time from last session

  useEffect(() => {
    const audioPlayerEl = audioPlayerElRef.current;
    if (!audioPlayerEl) return null;

    const updateCurrentTime = () => {
      setCurrentTime(audioPlayerEl.currentTime);
    };

    audioPlayerEl.addEventListener('timeupdate', updateCurrentTime);
    return () => audioPlayerEl.removeEventListener('timeupdate', updateCurrentTime);
  }, [audioPlayerElRef]);

  return currentTime;
};

export default useAudioPlayerCurrentTime;
