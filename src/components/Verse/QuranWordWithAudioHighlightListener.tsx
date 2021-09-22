import React from 'react';

import { useSelector } from 'react-redux';

import QuranWord, { QuranWordProps } from 'src/components/dls/QuranWord/QuranWord';
import { selectIsWordHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeWordLocation } from 'src/utils/verse';

// listen to selectIsWordHighlighted and render QuranWord with its value
const QuranWordWithAudioHighlightListener = ({
  word,
  font,
  isWordByWordAllowed,
}: QuranWordProps) => {
  const wordLocation = makeWordLocation(word.verseKey, word.position);
  const isHighlighted = useSelector(selectIsWordHighlighted(wordLocation));

  return (
    <QuranWord
      key={word.location}
      word={word}
      font={font}
      isWordByWordAllowed={isWordByWordAllowed}
      isHighlighted={isHighlighted}
    />
  );
};

export default React.memo(QuranWordWithAudioHighlightListener);
