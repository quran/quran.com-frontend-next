import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './TajweedBar.module.scss';

import NewLabel from '@/dls/Badge/NewLabel';
import useThemeDetector from '@/hooks/useThemeDetector';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { selectContextMenu } from '@/redux/slices/QuranReader/contextMenu';
import { logEvent } from '@/utils/eventLogger';

const TAJWEED_RULES = [
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
  const { t } = useTranslation('quran-reader');
  const ref = useRef(null);

  const [showTajweedBar, setShowTajweedBar] = useState(false);
  const [height, setHeight] = useState(0);
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);

  const { themeVariant } = useThemeDetector();

  const toggle = () => {
    setShowTajweedBar((prevShowTajweedBar) => !prevShowTajweedBar);
    if (showTajweedBar) {
      logEvent('tajweed_bar_closed');
    } else {
      logEvent('tajweed_bar_opened');
    }
  };

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ref.current?.clientHeight]);

  return (
    <div
      className={classNames(styles.container, {
        [styles.visibleContainer]: !isExpanded,
      })}
      style={{
        transform: `translateY(${showTajweedBar ? 0 : -height}px)`,
      }}
    >
      <div
        ref={ref}
        className={classNames(styles.tajweedContainer, {
          [styles.shadow]: showTajweedBar,
        })}
      >
        <div className={styles.rulesContainer}>
          {TAJWEED_RULES.map((rule) => (
            <div className={styles.ruleContainer} key={rule}>
              <div className={classNames(styles.circle, styles[`${themeVariant}-${rule}`])} />
              <p>{t(rule)}</p>
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
        <NewLabel />
        <span
          className={classNames(styles.chevronIconContainer, {
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
