/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import Button from '../dls/Button/Button';
import { playReciterStation } from '../Radio/ReciterStationList';

import styles from './ReciterInfo.module.scss';

import { getImageCDNPath } from 'src/utils/api';
import { logEvent } from 'src/utils/eventLogger';
import Reciter from 'types/Reciter';

type ReciterInfoProps = {
  selectedReciter: Reciter;
};
const ReciterInfo = ({ selectedReciter }: ReciterInfoProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isbioTruncated, setIsBioTruncated] = useState(true);

  const onPlayReciterStation = () => {
    logEvent('reciter_page_play_station');
    playReciterStation(selectedReciter, dispatch);
  };

  const bio =
    isbioTruncated && selectedReciter?.bio?.length > maxBioLength
      ? truncateText(selectedReciter?.bio, maxBioLength)
      : selectedReciter?.bio;

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
        <div className={styles.reciterBio}>
          {bio}
          {selectedReciter?.bio.length > maxBioLength && (
            <span
              className={styles.moreLessButton}
              role="button"
              tabIndex={0}
              onKeyPress={() => setIsBioTruncated((isTruncated) => !isTruncated)}
              onClick={() => setIsBioTruncated((isTruncated) => !isTruncated)}
            >
              {isbioTruncated ? t('common:more') : t('common:less')}
            </span>
          )}
        </div>
        <div className={styles.actionContainer}>
          <Button
            className={styles.playButton}
            prefix={<PlayIcon />}
            onClick={onPlayReciterStation}
          >
            {t('radio:play-radio')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const maxBioLength = 400;

const truncateText = (text: string, maxTextLength: number) => {
  return `${text.slice(0, maxTextLength)}...`;
};

export default ReciterInfo;
