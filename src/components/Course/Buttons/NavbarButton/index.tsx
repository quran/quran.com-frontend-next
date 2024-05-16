import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './NavbarButton.module.scss';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';
import { getCourseNavigationUrl } from '@/utils/navigation';

const LEARNING_PLAN_SLUG = 'preparing-our-hearts-for-ramadan';

const NavbarButton = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const onLearnMoreClicked = () => {
    logButtonClick('navbar_learning_plan');
    router.push(`${getCourseNavigationUrl(LEARNING_PLAN_SLUG)}`);
  };

  return (
    <Button
      size={ButtonSize.Small}
      onClick={onLearnMoreClicked}
      type={ButtonType.Warning}
      className={styles.cta}
    >
      {t('prepare-hearts.cta')}
    </Button>
  );
};

export default NavbarButton;
