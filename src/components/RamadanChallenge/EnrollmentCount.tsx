/* eslint-disable i18next/no-literal-string */
import useSWR from 'swr';

import styles from './EnrollmentCount.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { getGoalCount } from '@/utils/auth/api';
import { makeGoalCountUrl } from '@/utils/auth/apiPaths';
import { GoalCategory } from 'types/auth/Goal';

const MINIMUM_ENROLLMENT_COUNT = 500;

const EnrollmentCount = () => {
  const { data } = useSWR(makeGoalCountUrl({ type: GoalCategory.RAMADAN_CHALLENGE }), () =>
    getGoalCount(GoalCategory.RAMADAN_CHALLENGE),
  );
  const count = data?.data?.count;

  if (!data) {
    return <Skeleton className={styles.skeleton} />;
  }

  if (typeof count !== 'number' || count < MINIMUM_ENROLLMENT_COUNT) {
    return null;
  }

  return (
    <p>
      🌍 <span>{count}+</span> people around the world have joined the challenge!
    </p>
  );
};

export default EnrollmentCount;
