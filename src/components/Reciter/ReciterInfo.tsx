/* eslint-disable @next/next/no-img-element */
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import Button from '../dls/Button/Button';
import { playReciterStation } from '../Radio/ReciterStationList';

import styles from './ReciterInfo.module.scss';

import { getImageCDNPath } from 'src/utils/api';
import { logEvent } from 'src/utils/eventLogger';
import Reciter from 'types/Reciter';

const BIO_SAMPLE =
  'Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum, id quia. Optio reiciendis officia nobis accusantium quidem cumque, accusamus laboriosam amet officiis mollitia qui saepe, possimus, rem unde maxime atque?';

type ReciterInfoProps = {
  selectedReciter: Reciter;
};
const ReciterInfo = ({ selectedReciter }: ReciterInfoProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onPlayReciterStation = () => {
    logEvent('reciter_page_play_station');
    playReciterStation(selectedReciter, dispatch);
  };

  return (
    <div className={styles.container}>
      <div className={styles.reciterImageContainer}>
        <img
          className={styles.reciterImage}
          src={getImageCDNPath(selectedReciter?.profilePicture)}
          alt={selectedReciter?.name}
        />
      </div>
      <div>
        <div className={styles.reciterName}>{selectedReciter?.name}</div>
        <div
          className={styles.reciterBio}
          // dangerouslySetInnerHTML={{ __html: selectedReciter?.bio }}
        >
          {BIO_SAMPLE}
        </div>
        <Button prefix={<PlayIcon />} onClick={onPlayReciterStation}>
          {t('radio:play-radio')}
        </Button>
      </div>
    </div>
  );
};

export default ReciterInfo;
