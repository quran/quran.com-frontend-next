/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button from '../dls/Button/Button';
import { StationType } from '../Radio/types';

import styles from './ReciterInfo.module.scss';

import PlayIcon from '@/icons/play-arrow.svg';
import { makeCDNUrl } from '@/utils/cdn';
import { logEvent } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Reciter from 'types/Reciter';

type ReciterInfoProps = {
  selectedReciter: Reciter;
};

const ReciterInfo = ({ selectedReciter }: ReciterInfoProps) => {
  const { t } = useTranslation();

  const audioService = useContext(AudioPlayerMachineContext);
  const [isBioTruncated, setIsBioTruncated] = useState(true);

  const onPlayReciterStation = () => {
    logEvent('reciter_page_play_station');
    audioService.send({
      type: 'PLAY_RADIO',
      stationId: selectedReciter.id,
      stationType: StationType.Reciter,
    });
  };

  const bio =
    isBioTruncated && selectedReciter?.bio?.length > maxBioLength
      ? truncateText(selectedReciter?.bio, maxBioLength)
      : selectedReciter?.bio;

  return (
    <div className={styles.container}>
      <div className={styles.reciterImageContainer}>
        <img
          className={styles.reciterImage}
          src={makeCDNUrl(selectedReciter?.profilePicture)}
          alt={selectedReciter?.translatedName?.name}
        />
      </div>
      <div>
        <div className={styles.reciterName}>{selectedReciter?.translatedName?.name}</div>
        <div className={styles.reciterBio}>
          <span dangerouslySetInnerHTML={{ __html: bio }} />
          {selectedReciter?.bio.length > maxBioLength && (
            <span
              className={styles.moreLessButton}
              role="button"
              tabIndex={0}
              onKeyPress={() => setIsBioTruncated((isTruncated) => !isTruncated)}
              onClick={() => setIsBioTruncated((isTruncated) => !isTruncated)}
            >
              {isBioTruncated ? t('common:more') : t('common:less')}
            </span>
          )}
        </div>
        <div className={styles.actionContainer}>
          <Button
            className={styles.playButton}
            prefix={<PlayIcon />}
            onClick={onPlayReciterStation}
            shouldFlipOnRTL={false}
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
