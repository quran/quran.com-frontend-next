/* eslint-disable no-nested-ternary */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './WeeklyVerses.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PdfIcon from '@/icons/pdf.svg';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getQuranicCalendarRangesNavigationUrl,
  QuranicCalendarRangesNavigationSettings,
} from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

type ActionButtonsProps = {
  onMarkAsCompletedClick: () => void;
  isCompleted: boolean;
  shouldShowLoading: boolean;
  pdfUrl?: string;
  onHelpClick: (e: React.MouseEvent) => void;
  ranges: string;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onMarkAsCompletedClick,
  isCompleted,
  shouldShowLoading,
  pdfUrl,
  onHelpClick,
  ranges,
}) => {
  const { t } = useTranslation('quranic-calendar');

  const handlePdfClick = () => {
    logButtonClick('quran_calendar_pdf');
  };

  const handleReadOnlineClick = () => {
    logButtonClick('quran_calendar_read_online');
  };

  const isMobileBrowser = isMobile();

  return (
    <div className={styles.actionButtons}>
      <Button
        onClick={onMarkAsCompletedClick}
        isDisabled={shouldShowLoading}
        isLoading={shouldShowLoading}
        variant={ButtonVariant.Outlined}
        size={ButtonSize.Small}
        className={classNames(styles.button, {
          [styles.markAsCompletedButton]: !isCompleted,
          [styles.completedButton]: isCompleted,
        })}
      >
        {isMobileBrowser ? '✔' : !isCompleted ? t('mark-as-completed') : t('week-completed')}
      </Button>
      <div className={styles.rightButtons}>
        <div className={styles.pdfButtonContainer}>
          <Button
            onClick={handlePdfClick}
            href={pdfUrl || '#'}
            isNewTab
            className={styles.pdfButton}
            variant={ButtonVariant.Outlined}
            size={ButtonSize.Small}
          >
            <div className={styles.pdfButtonContent}>
              <PdfIcon />
              {t('english-pdf')}
            </div>
          </Button>
          <Button
            className={styles.helpIconInButton}
            onClick={onHelpClick}
            aria-label={t('help-about-pdf')}
          >
            ?
          </Button>
        </div>
        <Button
          href={getQuranicCalendarRangesNavigationUrl(
            ranges,
            QuranicCalendarRangesNavigationSettings.DefaultSettings,
          )}
          size={ButtonSize.Small}
          onClick={handleReadOnlineClick}
          className={styles.button}
        >
          {t('read-online')}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
