import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './DonateButton.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';
import { makeDonatePageUrl, makeDonateUrl } from '@/utils/apiPaths';
import { isAppleDevice } from '@/utils/device-detector';
import { logEvent } from '@/utils/eventLogger';
import { navigateToExternalUrl } from '@/utils/url';

type Props = {
  source: DonateButtonClickSource;
};

const DonateButton: React.FC<Props> = ({ source }) => {
  const { t } = useTranslation('common');

  const onDonateClicked = () => {
    const href = isAppleDevice() ? makeDonatePageUrl() : makeDonateUrl(true);
    logEvent('donate_button_clicked', {
      source,
    });
    navigateToExternalUrl(href);
  };

  return (
    <Button onClick={onDonateClicked} type={ButtonType.Warning} className={styles.cta}>
      {t('donate')}
    </Button>
  );
};

export default DonateButton;
