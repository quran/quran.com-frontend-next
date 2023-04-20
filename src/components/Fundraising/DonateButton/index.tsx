import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './DonateButton.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';
import DonateButtonType from '@/types/DonateButtonType';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logEvent } from '@/utils/eventLogger';
import { navigateToExternalUrl } from '@/utils/url';

type Props = {
  source: DonateButtonClickSource;
  type?: DonateButtonType;
  isOutlined?: boolean;
};

const DonateButton: React.FC<Props> = ({ source, type, isOutlined = false }) => {
  const { t } = useTranslation('common');

  const onDonateClicked = () => {
    const isOnceDonation = !type || type === DonateButtonType.ONCE;
    const href = makeDonatePageUrl(isOnceDonation);
    logEvent('donate_button_clicked', {
      /**
       * Examples:
       * - donate_popover_monthly
       * - donate_popover_once
       * - banner
       * - sidebar_banner_monthly
       */
      source: `${source}${type ? `_${type}` : ''}`,
    });
    navigateToExternalUrl(href);
  };

  const buttonTextTranslationKey = type ? `donate_${type}` : 'donate';

  return (
    <Button
      onClick={onDonateClicked}
      type={ButtonType.Warning}
      className={styles.cta}
      {...(isOutlined === true && { variant: ButtonVariant.Outlined })}
    >
      {t(buttonTextTranslationKey)}
    </Button>
  );
};

export default DonateButton;
