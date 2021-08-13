import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsMinimized, setIsMinimized } from 'src/redux/slices/AudioPlayer/state';

const AudioPlayerAdjustment = () => {
  const dispatch = useDispatch();
  const isMinimized = useSelector(selectIsMinimized);
  const options = ['true', 'false'];

  return (
    <label htmlFor="audio-player-is-minimized">
      Audio player isMinimized
      <select
        name="audio-player-is-minimized"
        onChange={(event) =>
          dispatch({ type: setIsMinimized.type, payload: event.target.value === 'true' })
        }
        value={isMinimized}
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
};

export default AudioPlayerAdjustment;
