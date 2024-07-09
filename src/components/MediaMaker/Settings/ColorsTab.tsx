import { FC } from 'react';

import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import BackgroundSettings from './TextBackgroundSettings';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';

const DEBOUNCE_COLOR_PICKER_FOR_MS = 1000;

type ColorsTabProps = {
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const ColorsTab: FC<ColorsTabProps> = ({ mediaSettings, onSettingsUpdate }) => {
  const { t } = useTranslation('quran-media-maker');

  const onFontChange = (event) => {
    debouncedOnChange(event.target.value);
  };

  const debouncedOnChange = debounce((color) => {
    onSettingsUpdate({ fontColor: color }, 'fontColor', color);
  }, DEBOUNCE_COLOR_PICKER_FOR_MS);

  return (
    <div>
      <BackgroundSettings
        shouldHaveBorder={mediaSettings.shouldHaveBorder}
        backgroundColorId={mediaSettings.backgroundColorId}
        opacity={mediaSettings.opacity}
        onSettingsUpdate={onSettingsUpdate}
      />
      <Section>
        <Section.Title>{t('text-color')}</Section.Title>
        <Section.Row>
          <input
            className={styles.colorPicker}
            type="color"
            value={mediaSettings.fontColor}
            onChange={onFontChange}
          />
        </Section.Row>
      </Section>
    </div>
  );
};

export default ColorsTab;
