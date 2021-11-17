import Image from 'next/image';

import styles from './HomePageImage.module.scss';
import PrayerTimes from './PrayerTimes/PrayerTimes';

import homepageImage from 'public/images/homepage.png';

const HomePageImage = () => {
  return (
    <div className={styles.homepageImageContainer}>
      <Image
        className={styles.homepageImage}
        src={homepageImage}
        objectFit="cover"
        sizes="(max-width: 425px) 300vw, 80vw"
        quality={10}
        priority
        layout="fill" // the image will scale the dimensions down for smaller viewports and scale up for larger viewports
        placeholder="blur" // to have a blur effect while loading.
      />
      <PrayerTimes />
    </div>
  );
};
export default HomePageImage;
