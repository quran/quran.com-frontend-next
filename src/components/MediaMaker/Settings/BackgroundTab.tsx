import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import BackgroundVideos from './BackgroundVideos';
import OrientationSettings from './OrientationSettings';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';

type BackgroundTabProps = {
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const BackgroundTab: FC<BackgroundTabProps> = ({ mediaSettings, onSettingsUpdate }) => {
  const { t } = useTranslation('quran-media-maker');
  return (
    <Section>
      <Section.Title>{t('video-picker')}</Section.Title>
      <Section.Row>
        <BackgroundVideos videoId={mediaSettings.videoId} onSettingsUpdate={onSettingsUpdate} />
      </Section.Row>

      <Section.Row>
        <OrientationSettings
          orientation={mediaSettings.orientation}
          onSettingsUpdate={onSettingsUpdate}
        />
      </Section.Row>
    </Section>
  );
};

export default BackgroundTab;
