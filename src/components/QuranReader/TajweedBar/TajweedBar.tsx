import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TajweedBar.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';

const TAJWEED_COLORS = ['edgham', 'mad-2', 'mad-2-4-6', 'mad-4-5', 'mad-6', 'ekhfa', 'qalqala'];

const TajweedColors = () => {
  const [showTajweedBar, setShowTajweedBar] = useState(false);

  const { t } = useTranslation('quran-reader');

  const toggle = () => {
    setShowTajweedBar(!showTajweedBar);
  };

  return (
    <div className={classNames(styles.container)}>
      <div
        className={classNames(styles.tajweedContainer, {
          [styles.hide]: !showTajweedBar,
        })}
      >
        <div className={styles.colorsContainer}>
          {TAJWEED_COLORS.map((color) => (
            <div className={styles.colorContainer} key={color}>
              <div className={classNames(styles.circle, styles[color])} />
              <p>{t(color)}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={classNames(styles.switcher)}
        onClick={toggle}
        onKeyDown={toggle}
        role="button"
        tabIndex={0}
      >
        <p>{t('tajweed-colors')}</p>
        <span
          className={classNames({
            [styles.rotate180]: showTajweedBar,
            [styles.rotateAuto]: !showTajweedBar,
          })}
        >
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
};

export default TajweedColors;
