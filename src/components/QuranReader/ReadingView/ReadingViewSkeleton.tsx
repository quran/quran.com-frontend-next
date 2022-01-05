import classNames from 'classnames';
import range from 'lodash/range';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './ReadingPreviewSkeleton.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';

const ReadingPreviewSkeleton = () => {
  const numberOfLines = 15;
  const { quranFont, quranTextFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  ) as QuranReaderStyles;

  return (
    <div>
      {range(numberOfLines).map((i) => (
        <Skeleton
          key={i}
          className={classNames(
            styles.skeleton,

            [styles[`${quranFont}-font-size-${quranTextFontScale}`]],
          )}
        />
      ))}
    </div>
  );
};

export default ReadingPreviewSkeleton;
