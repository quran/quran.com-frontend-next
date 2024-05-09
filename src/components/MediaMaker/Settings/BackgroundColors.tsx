import classNames from 'classnames';

import styles from '../MediaMaker.module.scss';

import { ChangedSettings } from '@/types/Media/MediaSettings';
import { getAllBackgrounds } from '@/utils/media/utils';

const COLORS = getAllBackgrounds();
type Props = {
  backgroundColorId: number;
  onSettingsUpdate: (settings: ChangedSettings) => void;
};

const BackgroundColors: React.FC<Props> = ({ onSettingsUpdate, backgroundColorId }) => {
  const onBackgroundColorSelected = (colorId: number) => {
    onSettingsUpdate({ backgroundColorId: colorId });
  };

  return (
    <div className={styles.backgroundColorsWrapper}>
      {COLORS.map((color, index) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={classNames(styles.colorBox, {
            [styles.selectedSetting]: backgroundColorId === color.id,
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
