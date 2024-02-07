/* eslint-disable react-func/max-lines-per-function */
import React, { useCallback, useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './RandomButton.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import CaretDownIcon from '@/icons/caret-down.svg';
import RepeatIcon from '@/icons/repeat.svg';
import { selectCustomSelection, selectSurahLogs } from '@/redux/slices/QuranReader/readingTracker';
import { getRandomAll } from '@/utils/random';

const RandomButton: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const surahLogs = useSelector(selectSurahLogs, shallowEqual);
  const customSelection = useSelector(selectCustomSelection, shallowEqual);

  /**
   * This is the list of options shown in the popover menu to pick a random surah/ayah.
   *
   * We need to memoize this list so that it is not re-generated on every re-render.
   * We should only need it to generate the random keys once each time the popover opens.
   */
  const MENU_OPTIONS = useMemo(() => {
    const { randomSurahId, randomSurahAyahId, randomReadSurahId, randomReadSurahAyahId } =
      getRandomAll(chaptersData, customSelection || surahLogs, t('verse').toLowerCase());

    //  If the user has no previously read surahs, we need to hide the last 2 options
    const output = [
      {
        name: t('random.any-surah'),
        key: randomSurahId,
        slug: randomSurahId,
      },
      {
        name: t('random.any-ayah'),
        key: randomSurahAyahId,
        slug: randomSurahAyahId.replace(':', '?startingVerse='),
      },
    ];
    if (randomReadSurahId && randomReadSurahAyahId) {
      output.push(
        {
          name: t('random.selected-surah'),
          key: randomReadSurahId,
          slug: randomReadSurahId,
        },
        {
          name: t('random.selected-ayah'),
          key: randomReadSurahAyahId,
          slug: randomReadSurahAyahId.replace(':', '?startingVerse='),
        },
      );
    }
    output.push({
      name: t('random.edit'),
      key: 'randomPage',
      slug: 'random',
    });
    return output;
  }, [chaptersData, customSelection, surahLogs, t]);

  const renderOptions = useCallback(
    () =>
      MENU_OPTIONS.map((option) => (
        <PopoverMenu.Item
          shouldCloseMenuAfterClick
          key={option.key}
          onClick={() => router.push(option.slug)}
        >
          {option.name}
        </PopoverMenu.Item>
      )),
    [MENU_OPTIONS, router],
  );

  return (
    <div className={styles.buttonContainer}>
      <Link href="/random">
        <Button
          prefix={<RepeatIcon />}
          size={ButtonSize.Small}
          href="/random"
          className={styles.button}
        >
          {t('random.pick-random')}
        </Button>
      </Link>
      <PopoverMenu
        trigger={
          <Button shape={ButtonShape.Square} size={ButtonSize.Small} className={styles.button}>
            <CaretDownIcon />
          </Button>
        }
      >
        {renderOptions()}
      </PopoverMenu>
    </div>
  );
};

export default RandomButton;
