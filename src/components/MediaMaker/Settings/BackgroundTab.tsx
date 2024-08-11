import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import BackgroundVideos from './BackgroundVideos';
import OrientationSettings from './OrientationSettings';

import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';

type BackgroundTabProps = {
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const BackgroundTab: FC<BackgroundTabProps> = ({ mediaSettings, onSettingsUpdate }) => {
  const { t } = useTranslation('quran-media-maker');
  return (
    <div className={styles.tabContainer}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('video-picker')}</div>
        <BackgroundVideos videoId={mediaSettings.videoId} onSettingsUpdate={onSettingsUpdate} />
      </div>

      <OrientationSettings
        orientation={mediaSettings.orientation}
        onSettingsUpdate={onSettingsUpdate}
      />
    </div>
  );
};

export default BackgroundTab;
