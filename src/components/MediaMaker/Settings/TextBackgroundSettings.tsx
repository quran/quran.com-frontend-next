import React from 'react';

import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Counter from '@/dls/Counter/Counter';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import { MAXIMUM_OPACITY, MINIMUM_OPACITY, OPACITY_VALUES } from '@/utils/media/constants';

const DEBOUNCE_MS = 1000;

interface Props extends MediaSettingsProps {
  opacity: number;
  backgroundColor: string;
}

const TextBackgroundSettings: React.FC<Props> = ({
  onSettingsUpdate,
  opacity,
  backgroundColor,
}) => {
  const { t } = useTranslation('media');

  const debouncedOnChange = debounce((color) => {
    onSettingsUpdate({ backgroundColor: color }, 'backgroundColor', color);
  }, DEBOUNCE_MS);

  const onColorChange = (event) => {
    debouncedOnChange(event.target.value);
  };

  const onOpacityDecreaseClicked = () => {
    const currentIndex = OPACITY_VALUES.findIndex((value) => value === opacity);
    const value = OPACITY_VALUES[currentIndex - 1];
    onSettingsUpdate({ opacity: value }, 'opacity', value);
  };

  const onOpacityIncreaseClicked = () => {
    const currentIndex = OPACITY_VALUES.findIndex((value) => value === opacity);
    const value = OPACITY_VALUES[currentIndex + 1];
    onSettingsUpdate({ opacity: value }, 'opacity', value);
  };

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('background-opacity')}</div>
        <div className={styles.colorPickerContainer}>
          <input
            className={styles.colorPicker}
            type="color"
            value={backgroundColor}
            onChange={onColorChange}
          />
        </div>

        <div className={(styles.counterContainer, styles.opacityCounter)}>
          <Counter
            isPercent
            count={opacity}
            onDecrement={opacity === MINIMUM_OPACITY ? null : onOpacityDecreaseClicked}
            onIncrement={opacity === MAXIMUM_OPACITY ? null : onOpacityIncreaseClicked}
          />
        </div>
      </div>
    </>
  );
};
export default TextBackgroundSettings;
