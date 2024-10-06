import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Switch from '@/dls/Switch/Switch';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import Orientation from '@/types/Media/Orientation';

interface Props extends MediaSettingsProps {
  orientation: Orientation;
}

const OrientationSettings: React.FC<Props> = ({ onSettingsUpdate, orientation }) => {
  const { t } = useTranslation('media');

  const onOrientationChange = (val: Orientation) => {
    onSettingsUpdate({ orientation: val }, 'orientation', val);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('orientation')}</div>
      <Switch
        items={[
          { name: t(Orientation.LANDSCAPE), value: Orientation.LANDSCAPE },
          { name: t(Orientation.PORTRAIT), value: Orientation.PORTRAIT },
        ]}
        selected={orientation}
        onSelect={onOrientationChange}
      />
    </div>
  );
};

export default OrientationSettings;
