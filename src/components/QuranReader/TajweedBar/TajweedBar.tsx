import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './TajweedBar.module.scss';

import useThemeDetector from '@/hooks/useThemeDetector';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import {
  selectContextMenu,
  selectIsTajweedBarExpanded,
  setIsTajweedBarExpanded,
} from '@/redux/slices/QuranReader/contextMenu';
import { logEvent } from '@/utils/eventLogger';

// Ensures bar starts off-screen before measurement to prevent flash on mount
const DEFAULT_COLLAPSED_HEIGHT = 100;

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
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const [height, setHeight] = useState(DEFAULT_COLLAPSED_HEIGHT);
  const showTajweedBar = useSelector(selectIsTajweedBarExpanded);
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);

  const { themeVariant } = useThemeDetector();

  const toggle = () => {
    dispatch(setIsTajweedBarExpanded(!showTajweedBar));
    if (showTajweedBar) {
      logEvent('tajweed_bar_closed');
    } else {
      logEvent('tajweed_bar_opened');
    }
  };

  useEffect(() => {
    if (ref.current && ref.current.clientHeight > 0) {
      setHeight(ref.current.clientHeight);
    }
  }, []);

  return (
    <div
      className={classNames(styles.container, {
        [styles.visibleContainer]: !isExpanded,
      })}
    >
      <div
        className={styles.rulesWrapper}
        style={{
          height: showTajweedBar ? height : 0,
          overflow: 'hidden',
          transition: 'height 0.2s ease-in-out',
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
