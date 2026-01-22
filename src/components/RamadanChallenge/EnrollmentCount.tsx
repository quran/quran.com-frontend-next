/* eslint-disable i18next/no-literal-string */
import useSWR from 'swr';

import { getRamadanChallengeCount } from '@/utils/auth/api';
import { makeRamadanChallengeCountUrl } from '@/utils/auth/apiPaths';

const MINIMUM_ENROLLMENT_COUNT = 500;

const EnrollmentCount = () => {
  const { data } = useSWR(makeRamadanChallengeCountUrl(), getRamadanChallengeCount);

  const count = data?.data?.count;

  if (!count || count <= MINIMUM_ENROLLMENT_COUNT) {
    return null;
  }

  return <h2>🌍 {count}+ people around the world have joined the challenge!</h2>;
};

export default EnrollmentCount;
