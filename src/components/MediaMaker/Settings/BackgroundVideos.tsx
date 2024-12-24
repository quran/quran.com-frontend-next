import { useState } from 'react';

import classNames from 'classnames';
import Image from 'next/image';

import styles from '../MediaMaker.module.scss';

import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import { getVideosArray } from '@/utils/media/utils';

const videos = getVideosArray();

interface Props extends MediaSettingsProps {
  videoId: number;
}

const BackgroundVideos: React.FC<Props> = ({ onSettingsUpdate, videoId }) => {
  const [selectedVideoId, setSelectedVideoId] = useState(videoId);

  const onVideoSelected = (newVideId: number) => {
    setSelectedVideoId(newVideId);
    onSettingsUpdate({ videoId: newVideId }, 'videoId', newVideId);
  };

  return (
    <div className={styles.BackgroundVideosWrapper}>
      {videos.map((video) => (
        <Image
          alt={video.id}
          key={video.id}
          className={classNames(styles.img, {
            [styles.selectedSetting]: video.id === selectedVideoId,
          })}
          onClick={() => {
            onVideoSelected(video.id);
          }}
          src={video.thumbnailSrc}
          width="100"
          height="100"
        />
      ))}
    </div>
  );
};

export default BackgroundVideos;
