import classNames from 'classnames';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';

import styles from '../video.module.scss';
import { getVideosArray } from '../VideoUtils';

import { selectVideoId, updateSettings } from '@/redux/slices/videoGenerator';

const videos = getVideosArray();

const BackgroundVideos = ({ seekToBeginning }) => {
  const videoId = useSelector(selectVideoId);
  const dispatch = useDispatch();
  const onVideoSelected = (newVideId: number) => {
    seekToBeginning();
    dispatch(updateSettings({ videoId: newVideId }));
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
