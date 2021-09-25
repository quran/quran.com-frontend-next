import { useEffect, useState, useMemo, useCallback } from 'react';

import throttle from 'lodash/throttle';

const useAudioPlayerCurrentTime = (
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>,
  throttlingWaitTime = 0,
) => {
  const [currentTime, setCurrentTime] = useState(0); // TODO: get current time from last session

  const updateCurrentTime = useCallback(() => {
    if (audioPlayerElRef.current) {
      setCurrentTime(audioPlayerElRef.current.currentTime);
    }
  }, [audioPlayerElRef]);

  const updateCurrentTimeThrottled = useMemo(
    () => throttle(updateCurrentTime, throttlingWaitTime),
    [updateCurrentTime, throttlingWaitTime],
  );
  useEffect(() => {
    const audioPlayerEl = audioPlayerElRef.current;
    if (!audioPlayerEl) return null;

    audioPlayerEl.addEventListener('timeupdate', updateCurrentTimeThrottled);
    return () => audioPlayerEl.removeEventListener('timeupdate', updateCurrentTimeThrottled);
  }, [audioPlayerElRef, updateCurrentTimeThrottled]);

  return currentTime;
};

export default useAudioPlayerCurrentTime;
