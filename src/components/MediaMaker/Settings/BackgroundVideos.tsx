import classNames from 'classnames';
import Image from 'next/image';
import { useSelector } from 'react-redux';

import styles from '../MediaMaker.module.scss';

import { selectVideoId } from '@/redux/slices/mediaMaker';
import { getVideosArray } from '@/utils/media/utils';

const videos = getVideosArray();

type Props = {
  onSettingsUpdate: (settings: Record<string, any>) => void;
};

const BackgroundVideos: React.FC<Props> = ({ onSettingsUpdate }) => {
  const videoId = useSelector(selectVideoId);
  const onVideoSelected = (newVideId: number) => {
    onSettingsUpdate({ videoId: newVideId });
  };

  return (
    <div className={styles.BackgroundVideosWrapper}>
      {videos.map((video) => (
        <Image
          key={video.id}
          className={classNames(styles.img, {
            [styles.selectedSetting]: video.id === videoId,
          })}
          onClick={() => {
            onVideoSelected(video.id);
          }}
          src={video.thumbnailSrc}
          width="300px"
          height="300px"
        />
      ))}
    </div>
  );
};

export default BackgroundVideos;
