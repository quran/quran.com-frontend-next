/* eslint-disable i18next/no-literal-string */
import { useActor } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import Link, { LinkVariant } from '../dls/Link/Link';

import styles from './PlayRadioButton.module.scss';

import { logButtonClick } from '@/utils/eventLogger';
import useCurrentStationInfo from 'src/xstate/Radio/useCurrentStationInfo';

const RadioInformation = ({ radioActor }) => {
  const [state] = useActor(radioActor);

  const stationInfo = useCurrentStationInfo((state as any).context);
  const { t } = useTranslation('radio');

  const onChangeClicked = () => {
    logButtonClick('homepage_change_radio');
  };

  return (
    <div className={styles.stationInfo}>
      <span className={styles.stationTitle}>
        <span className={styles.station}>{t('station')}</span>: {stationInfo.title}
      </span>{' '}
      <Link
        variant={LinkVariant.Highlight}
        onClick={onChangeClicked}
        href="/radio"
        className={styles.editStationButton}
      >
        ({t('change')})
      </Link>
    </div>
  );
};

export default RadioInformation;
