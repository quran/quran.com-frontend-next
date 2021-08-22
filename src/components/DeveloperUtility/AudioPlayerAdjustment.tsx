import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectVisibility, setVisibility, Visibility } from 'src/redux/slices/AudioPlayer/state';

const AudioPlayerAdjustment = () => {
  const dispatch = useDispatch();
  const isMinimized = useSelector(selectVisibility);
  const options = [Visibility.Default, Visibility.Expanded, Visibility.Minimized];

  return (
    <label htmlFor="audio-player-is-minimized">
      Audio player isMinimized
      <select
        name="audio-player-is-minimized"
        onChange={(event) => dispatch({ type: setVisibility.type, payload: event.target.value })}
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
