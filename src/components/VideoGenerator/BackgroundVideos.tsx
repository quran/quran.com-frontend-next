import Image from 'next/image';

import styles from './video.module.scss';
import { getVideosArray } from './VideoUtils';

const videos = getVideosArray();

const BackgroundVideos = ({ setVideo, seekToBeginning }) => {
  const onVideoSelected = (video) => {
    seekToBeginning();
    setVideo(video);
  };

  return (
    <div className={styles.BackgroundVideosWrapper}>
      {videos.map((video, index) => (
        <Image
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={styles.img}
          onClick={() => {
            onVideoSelected(video);
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
