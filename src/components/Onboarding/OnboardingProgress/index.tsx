import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import { onboardingChecklist } from '../steps';

import styles from './OnboardingProgress.module.scss';

import Progress from '@/dls/Progress';
import { selectOnboarding } from '@/redux/slices/onboarding';
import { toLocalizedNumber } from '@/utils/locale';
import { convertFractionToPercent } from '@/utils/number';

const OnboardingProgress = () => {
  const { t, lang } = useTranslation('common');
  const checklistItems = onboardingChecklist(t);
  const { completedGroups } = useSelector(selectOnboarding);
  const completedPercent = convertFractionToPercent(
    Object.values(completedGroups).filter((group) => group?.isCompleted === true).length /
      checklistItems.length,
  );
  const localizedPercent = toLocalizedNumber(completedPercent, lang);
  return (
    <div className={styles.progressContainer}>
      <p>{localizedPercent}%</p>
      <Progress value={completedPercent} rootStyles={styles.progressBar} />
    </div>
  );
};

export default OnboardingProgress;
