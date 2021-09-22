import React from 'react';

import { useSelector } from 'react-redux';

import QuranWord, { QuranWordProps } from 'src/components/dls/QuranWord/QuranWord';
import { selectIsWordHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';

const QuranWordWithHighlight = ({ word, font, isWordByWordAllowed }: QuranWordProps) => {
  const wordLocation = `${word.verseKey}:${word.position}`;
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

export default React.memo(QuranWordWithHighlight);
