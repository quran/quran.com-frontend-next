import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TajweedBar.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';

const TAJWEED_COLORS = [
  'edgham',
  'mad-2',
  'mad-2-4-6',
  'mad-4-5',
  'mad-6',
  'ekhfa',
  'qalqala',
  'tafkhim',
];

const TajweedColors = () => {
  const [showTajweedBar, setShowTajweedBar] = useState(true);
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  const { t } = useTranslation('quran-reader');

  const toggle = () => {
    setShowTajweedBar((prevShowTajweedBar) => !prevShowTajweedBar);
    if (showTajweedBar) {
      logEvent('tajweed_bar_opened');
    } else {
      logEvent('tajweed_bar_closed');
    }
  };

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ref.current?.clientHeight]);

  return (
    <div
      className={classNames(styles.container)}
      style={{
        transform: `translateY(${showTajweedBar ? 0 : -height}px)`,
      }}
    >
      <div
        ref={ref}
        className={classNames(styles.tajweedContainer, {
          [styles.colorsBarVisible]: showTajweedBar,
          [styles.colorsBarInvisible]: !showTajweedBar,
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
            [styles.rotate]: !showTajweedBar,
          })}
        >
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
};

export default TajweedColors;
