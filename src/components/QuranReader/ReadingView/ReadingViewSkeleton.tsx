import classNames from 'classnames';
import range from 'lodash/range';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './ReadingViewSkeleton.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import verseTextStyles from 'src/components/Verse/VerseText.module.scss';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFontClassName } from 'src/utils/fontFaceHelper';
import { getMushafLinesNumber } from 'src/utils/page';

const ReadingViewSkeleton = () => {
  const { quranFont, quranTextFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const numberOfLines = getMushafLinesNumber(quranFont, mushafLines);

  return (
    <div className={styles.skeletonContainer}>
      {range(numberOfLines).map((i) => (
        <Skeleton
          key={i}
          className={classNames(styles.skeleton, [
            verseTextStyles[getFontClassName(quranFont, quranTextFontScale, mushafLines)],
          ])}
        />
      ))}
    </div>
  );
};

export default ReadingViewSkeleton;
