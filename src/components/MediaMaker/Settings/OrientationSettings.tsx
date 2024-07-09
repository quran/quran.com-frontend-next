import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import Orientation from '@/types/Media/Orientation';

interface Props extends MediaSettingsProps {
  orientation: Orientation;
}

const OrientationSettings: React.FC<Props> = ({ onSettingsUpdate, orientation }) => {
  const { t } = useTranslation('quran-media-maker');

  const onOrientationChange = (val: Orientation) => {
    onSettingsUpdate({ orientation: val }, 'orientation', val);
  };

  return (
    <Section>
      <Section.Title>{t('orientation')}</Section.Title>
      <Switch
        items={[
          { name: t(Orientation.LANDSCAPE), value: Orientation.LANDSCAPE },
          { name: t(Orientation.PORTRAIT), value: Orientation.PORTRAIT },
        ]}
        selected={orientation}
        onSelect={onOrientationChange}
      />
    </Section>
  );
};

export default OrientationSettings;
