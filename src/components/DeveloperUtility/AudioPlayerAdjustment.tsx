import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsExpanded, setIsExpanded } from 'src/redux/slices/AudioPlayer/state';

const AudioPlayerAdjustment = () => {
  const dispatch = useDispatch();
  const isExpanded = useSelector(selectIsExpanded);

  return (
    <div>
      Audio player{' '}
      <button
        type="button"
        onClick={() => dispatch({ type: setIsExpanded.type, payload: !isExpanded })}
      >
        Toggle Expansion
      </button>
    </div>
  );
};

export default AudioPlayerAdjustment;
