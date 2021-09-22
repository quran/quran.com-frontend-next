import React from 'react';

import { useSelector } from 'react-redux';

import Line, { LineProps } from './Line';

import { selectIsLineHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';

const LineWithHighlight = ({ lineKey, words, isBigTextLayout }: LineProps) => {
  const isHighlighted = useSelector(selectIsLineHighlighted(words.map((word) => word.verseKey)));
  return (
    <Line
      lineKey={lineKey}
      words={words}
      isBigTextLayout={isBigTextLayout}
      isHighlighted={isHighlighted}
    />
  );
};

export default React.memo(LineWithHighlight);
