import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectReadingPreferences,
  toggleShowWordByWordTranslation,
  toggleShowWordByWordTransliteration,
} from 'src/redux/slices/QuranReader/readingPreferences';

const WordByWordAdjustment: React.FC = () => {
  const { showWordByWordTranslation, showWordByWordTransliteration } =
    useSelector(selectReadingPreferences);
  const dispatch = useDispatch();

  const onToggleTranslation = () => {
    dispatch({ type: toggleShowWordByWordTranslation.type });
  };
  const onToggleTransliteration = () => {
    dispatch({ type: toggleShowWordByWordTransliteration.type });
  };

  return (
    <div>
      WBW translations{' '}
      <input type="checkbox" checked={!!showWordByWordTranslation} onChange={onToggleTranslation} />{' '}
      WBW transliterations{' '}
      <input
        type="checkbox"
        checked={!!showWordByWordTransliteration}
        onChange={onToggleTransliteration}
      />
    </div>
  );
};

export default WordByWordAdjustment;
