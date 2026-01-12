/* eslint-disable react/no-danger */
import { useContext, useState, useMemo } from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import Button from '../dls/Button/Button';
import { StationType } from '../Radio/types';

import styles from './ReciterInfo.module.scss';

import PlayIcon from '@/icons/play-arrow.svg';
import { makeCDNUrl } from '@/utils/cdn';
import { logEvent } from '@/utils/eventLogger';
import { stripHtml, truncateHtml } from '@/utils/string';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Reciter from 'types/Reciter';

type ReciterInfoProps = {
  selectedReciter: Reciter;
};

const MAX_BIO_LENGTH = 400;

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

  const bioText = useMemo(() => stripHtml(selectedReciter?.bio || ''), [selectedReciter?.bio]);
  const shouldShowMoreButton = bioText.length > MAX_BIO_LENGTH;

  const displayBio = useMemo(() => {
    if (!selectedReciter?.bio) return '';
    if (isBioTruncated && shouldShowMoreButton) {
      return truncateHtml(selectedReciter.bio, MAX_BIO_LENGTH);
    }
    return selectedReciter.bio;
  }, [selectedReciter?.bio, isBioTruncated, shouldShowMoreButton]);

  return (
    <div className={styles.container}>
      <div className={styles.reciterImageContainer}>
        <Image
          className={styles.reciterImage}
          src={makeCDNUrl(selectedReciter?.profilePicture)}
          alt={selectedReciter?.translatedName?.name || 'Reciter profile'}
          width={100}
          height={100}
          priority
        />
      </div>
      <div>
        <div className={styles.reciterName}>{selectedReciter?.translatedName?.name}</div>
        <div className={styles.reciterBio}>
          <span dangerouslySetInnerHTML={{ __html: displayBio }} />
          {shouldShowMoreButton && (
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

export default ReciterInfo;
