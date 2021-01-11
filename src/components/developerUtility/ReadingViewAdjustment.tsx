import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectReadingView, setReadingView } from 'src/redux/slices/QuranReader/readingView';
import { ReadingView } from '../QuranReader/types';

const ReadingViewAdjustment = () => {
  const dispatch = useDispatch();
  const quranReaderViews = useSelector(selectReadingView);
  const availableReadingViews = [];

  Object.values(ReadingView).forEach((font) => availableReadingViews.push(font));

  return (
    <>
      {/* Reading View */}
      <label htmlFor="font-styles">
        Reading view{' '}
        <select
          name="font-styles"
          onChange={(event) => dispatch({ type: setReadingView.type, payload: event.target.value })}
          value={quranReaderViews}
        >
          {availableReadingViews.map((readingView) => (
            <option key={readingView} value={readingView}>
              {readingView}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};

export default ReadingViewAdjustment;
