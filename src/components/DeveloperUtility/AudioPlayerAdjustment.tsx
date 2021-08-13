import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsMinimized, setIsMinimized } from 'src/redux/slices/AudioPlayer/state';

const AudioPlayerAdjustment = () => {
  const dispatch = useDispatch();
  const isMinimized = useSelector(selectIsMinimized);
  const availableVisibilities = ['true', 'false'];

  return (
    <label htmlFor="audio-player-visibility">
      Audio player isMinimized
      <select
        name="audio-player-visibility"
        onChange={(event) =>
          dispatch({ type: setIsMinimized.type, payload: event.target.value === 'true' })
        }
        value={isMinimized}
      >
        {availableVisibilities.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
};

export default AudioPlayerAdjustment;
