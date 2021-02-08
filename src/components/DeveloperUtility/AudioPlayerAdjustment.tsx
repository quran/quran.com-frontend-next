import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AudioPlayerVisibility,
  selectAudioPlayerStyle,
  setVisibility,
} from 'src/redux/slices/AudioPlayer/style';

const AudioPlayerAdjustment = () => {
  const dispatch = useDispatch();
  const audioPlayerStyle = useSelector(selectAudioPlayerStyle);
  const availableVisibilities = [];

  Object.values(AudioPlayerVisibility).forEach((visibility) =>
    availableVisibilities.push(visibility),
  );

  return (
    <label htmlFor="audio-player-visibility">
      Audio player visibility{' '}
      <select
        name="audio-player-visibility"
        onChange={(event) => dispatch({ type: setVisibility.type, payload: event.target.value })}
        value={audioPlayerStyle.visibility}
      >
        {availableVisibilities.map((visibility) => (
          <option key={visibility} value={visibility}>
            {visibility}
          </option>
        ))}
      </select>
    </label>
  );
};

export default AudioPlayerAdjustment;
