import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './DonateButton.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import LearnMoreClickSource from '@/types/LearnMoreClickSource';
import { makeDonateUrl } from '@/utils/apiPaths';
import { logEvent } from '@/utils/eventLogger';

type Props = {
  source: LearnMoreClickSource;
};

const LearnMoreButton: React.FC<Props> = ({ source }) => {
  const { t } = useTranslation('common');

  const onButtonClicked = () => {
    logEvent('learn_more_button_clicked', {
      source,
    });
  };

  return (
    <Button
      isNewTab
      href={makeDonateUrl()}
      onClick={onButtonClicked}
      variant={ButtonVariant.Compact}
      className={classNames(styles.cta, styles.learnMore)}
    >
      {t('learn-more')}
    </Button>
  );
};

export default LearnMoreButton;
