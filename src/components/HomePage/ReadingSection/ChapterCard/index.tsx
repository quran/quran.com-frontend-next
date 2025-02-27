import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ChapterCard.module.scss';

import Card from '@/components/HomePage/Card';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ArrowIcon from '@/icons/arrow.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

type Props = {
  surahNumber: number;
  verseNumber?: number;
  isContinueReading?: boolean;
};

const ChapterCard: React.FC<Props> = ({
  surahNumber,
  verseNumber = 1,
  isContinueReading = false,
}) => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const surahNumberString = surahNumber.toString();
  const chapterData = getChapterData(chaptersData, surahNumberString);

  const onContinueReadingClicked = () => {
    logButtonClick('homepage_chapter_card_continue_reading');
  };

  const onBeginClicked = () => {
    logButtonClick('homepage_chapter_card_begin');
  };

  const link = getChapterWithStartingVerseUrl(`${surahNumber}:${verseNumber}`);

  return (
    <Card className={styles.chapterCard} {...(isContinueReading && { link })}>
      <div className={styles.surahContainer}>
        <div className={styles.surahName}>{surahNumberString.padStart(3, '0')}</div>
        <div className={styles.surahInfo}>
          <div>
            <span className={styles.transliteratedName}>
              {toLocalizedNumber(surahNumber, lang)}. {chapterData.transliteratedName}
            </span>
            <span className={styles.translatedName}>
              {' '}
              {isMobile() ? `${chapterData.translatedName}` : `(${chapterData.translatedName})`}
            </span>
          </div>
          {isContinueReading ? (
            <Link href={link} variant={LinkVariant.Primary} onClick={onContinueReadingClicked}>
              <div className={styles.continueReading}>
                <span>{t('common:verse')}</span>
                <span>{toLocalizedNumber(verseNumber, lang)}</span>
                <IconContainer
                  size={IconSize.Xsmall}
                  icon={<ArrowIcon />}
                  shouldForceSetColors={false}
                  className={styles.continueReadingArrowIcon}
                />
              </div>
            </Link>
          ) : (
            <Button
              size={ButtonSize.Small}
              href={link}
              onClick={onBeginClicked}
              className={styles.beginButton}
            >
              {t('begin')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChapterCard;
