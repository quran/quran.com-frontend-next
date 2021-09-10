import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectVisibility, setVisibility, Visibility } from 'src/redux/slices/AudioPlayer/state';

const options = [Visibility.Default, Visibility.Expanded];
const AudioPlayerAdjustment = () => {
  const dispatch = useDispatch();
  const visibility = useSelector(selectVisibility);

  return (
    <label htmlFor="audio-player-is-minimized">
      Audio player visibility
      <select
        name="audio-player-is-minimized"
        onChange={(event) => dispatch({ type: setVisibility.type, payload: event.target.value })}
        value={visibility}
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
