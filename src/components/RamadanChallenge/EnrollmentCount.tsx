/* eslint-disable i18next/no-literal-string */
import useSWR from 'swr';

import styles from './EnrollmentCount.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { getRamadanChallengeCount } from '@/utils/auth/api';
import { makeRamadanChallengeCountUrl } from '@/utils/auth/apiPaths';

const MINIMUM_ENROLLMENT_COUNT = 500;

const EnrollmentCount = () => {
  const { data } = useSWR(makeRamadanChallengeCountUrl(), getRamadanChallengeCount);
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
