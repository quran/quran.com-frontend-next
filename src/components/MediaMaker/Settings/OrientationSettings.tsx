import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';
import { ChangedSettings } from '@/types/Media/MediaSettings';
import Orientation from '@/types/Media/Orientation';

type Props = {
  onSettingsUpdate: (settings: ChangedSettings) => void;
  orientation: Orientation;
};

const OrientationSettings: React.FC<Props> = ({ onSettingsUpdate, orientation }) => {
  const { t } = useTranslation('quran-media-maker');

  const onOrientationChange = (val: Orientation) => {
    onSettingsUpdate({ orientation: val });
  };

  return (
    <Section>
      <Section.Title>{t('orientation')}</Section.Title>
      <Section.Row>
        <Switch
          items={[
            { name: t(Orientation.LANDSCAPE), value: Orientation.LANDSCAPE },
            { name: t(Orientation.PORTRAIT), value: Orientation.PORTRAIT },
          ]}
          selected={orientation}
          onSelect={onOrientationChange}
        />
      </Section.Row>
      <Section.Row>
        <div className={styles.orientationWrapper}>
          <div
            className={orientation === Orientation.LANDSCAPE ? styles.landscape : styles.portrait}
          />
        </div>
      </Section.Row>
    </Section>
  );
};

export default OrientationSettings;
