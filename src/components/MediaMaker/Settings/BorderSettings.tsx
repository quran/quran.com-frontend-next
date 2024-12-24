import React from 'react';

import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Counter from '@/dls/Counter/Counter';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import { MAXIMUM_BORDER, MINIMUM_BORDER } from '@/utils/media/constants';

const DEBOUNCE_MS = 1000;

interface Props extends MediaSettingsProps {
  borderSize: number;
  borderColor: string;
}

const BorderSettings: React.FC<Props> = ({ onSettingsUpdate, borderSize, borderColor }) => {
  const { t } = useTranslation('media');

  const debouncedOnChange = debounce((color) => {
    onSettingsUpdate({ borderColor: color }, 'borderColor', color);
  }, DEBOUNCE_MS);

  const onColorChange = (event) => {
    debouncedOnChange(event.target.value);
  };

  const onBorderDecreaseClicked = () => {
    const value = borderSize - 1;
    onSettingsUpdate({ borderSize: value }, 'borderSize', value);
  };

  const onBorderIncreaseClicked = () => {
    const value = borderSize + 1;
    onSettingsUpdate({ borderSize: value }, 'borderSize', value);
  };

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('border-color-size')}</div>
        <div className={styles.colorPickerContainer}>
          <input
            className={styles.colorPicker}
            type="color"
            value={borderColor}
            onChange={onColorChange}
          />
        </div>

        <div className={(styles.counterContainer, styles.opacityCounter)}>
          <Counter
            count={borderSize}
            onDecrement={borderSize === MINIMUM_BORDER ? null : onBorderDecreaseClicked}
            onIncrement={borderSize === MAXIMUM_BORDER ? null : onBorderIncreaseClicked}
          />
        </div>
      </div>
    </>
  );
};
export default BorderSettings;
