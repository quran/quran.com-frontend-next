import { useEffect, useState, useMemo, useCallback } from 'react';

import throttle from 'lodash/throttle';

const useAudioPlayerCurrentTime = (
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>,
  throttlingTime = 0,
) => {
  const [currentTime, setCurrentTime] = useState(0); // TODO: get current time from last session

  const updateCurrentTime = useCallback(() => {
    if (audioPlayerElRef.current) {
      setCurrentTime(audioPlayerElRef.current.currentTime);
    }
  }, [audioPlayerElRef]);

  const updateCurrentTimeThrottled = useMemo(
    () => throttle(updateCurrentTime, throttlingTime),
    [updateCurrentTime, throttlingTime],
  );

  const onTimeUpdate = useCallback(() => {
    return throttlingTime === 0 ? updateCurrentTime() : updateCurrentTimeThrottled();
  }, [throttlingTime, updateCurrentTime, updateCurrentTimeThrottled]);

  useEffect(() => {
    const audioPlayerEl = audioPlayerElRef.current;
    if (!audioPlayerEl) return null;

    audioPlayerEl.addEventListener('timeupdate', onTimeUpdate);
    return () => audioPlayerEl.removeEventListener('timeupdate', onTimeUpdate);
  }, [audioPlayerElRef, onTimeUpdate]);

  return currentTime;
};

export default useAudioPlayerCurrentTime;
