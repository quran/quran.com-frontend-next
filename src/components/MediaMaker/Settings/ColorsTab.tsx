import { FC } from 'react';

import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import BorderSettings from './BorderSettings';
import BackgroundSettings from './TextBackgroundSettings';

import Separator from '@/dls/Separator/Separator';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';

const DEBOUNCE_MS = 1000;

type ColorsTabProps = {
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const ColorsTab: FC<ColorsTabProps> = ({ mediaSettings, onSettingsUpdate }) => {
  const { t } = useTranslation('media');
  const { fontColor, backgroundColor, opacity, borderColor, borderSize } = mediaSettings;
  const onTextColorChange = (event) => {
    debouncedOnChange(event.target.value);
  };

  const debouncedOnChange = debounce((color) => {
    onSettingsUpdate({ fontColor: color }, 'fontColor', color);
  }, DEBOUNCE_MS);

  return (
    <div className={styles.tabContainer}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('text-color')}</div>
        <div className={styles.colorPickerContainer}>
          <input
            className={styles.colorPicker}
            type="color"
            value={fontColor}
            onChange={onTextColorChange}
          />
        </div>
      </div>
      <div className={styles.separatorContainer}>
        <Separator isVertical />
      </div>
      <BackgroundSettings
        backgroundColor={backgroundColor}
        opacity={opacity}
        onSettingsUpdate={onSettingsUpdate}
      />
      <div className={styles.separatorContainer}>
        <Separator isVertical />
      </div>
      <BorderSettings
        borderColor={borderColor}
        borderSize={borderSize}
        onSettingsUpdate={onSettingsUpdate}
      />
    </div>
  );
};

export default ColorsTab;
