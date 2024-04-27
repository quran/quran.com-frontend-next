import classNames from 'classnames';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import styles from './video.module.scss';
import { getAllBackgrounds } from './VideoUtils';

import { selectBackgroundColorId, updateSettings } from '@/redux/slices/videoGenerator';

const COLORS = getAllBackgrounds();

const BackgroundColors = () => {
  const dispatch = useDispatch();
  const selectedBackgroundColorId = useSelector(selectBackgroundColorId, shallowEqual);
  const onBackgroundColorSelected = (colorId: number) => {
    dispatch(updateSettings({ backgroundColorId: colorId }));
  };

  return (
    <div className={styles.backgroundColorsWrapper}>
      {COLORS.map((color, index) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={classNames(styles.colorBox, {
            [styles.selectedSetting]: selectedBackgroundColorId === color.id,
          })}
          onClick={() => {
            onBackgroundColorSelected(color.id);
          }}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          style={color}
        />
      ))}
    </div>
  );
};

export default BackgroundColors;
