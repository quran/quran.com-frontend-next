import styles from './video.module.scss';
import { getVideosArray } from './VideoUtils';
import Image from 'next/image'

const videos = getVideosArray();

const BackgroundVideos = ({ setVideo, seekToBeginning  }) => {
    const onVideoSelected = (video) => {
        seekToBeginning();
        setVideo(video);
    }

    return (
        <div className={styles.BackgroundVideosWrapper}>
            {videos.map((video, index) => (
                <Image key={index} className={styles.img} onClick={() => {onVideoSelected(video)}} src={video.thumbnailSrc} width='300px' height={'300px'} />
            ))}
        </div>
    )
}

export default BackgroundVideos;