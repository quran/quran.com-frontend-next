import { useSelector } from '@xstate/react';
import { useRouter } from 'next/router';

import { toLocalizedNumber } from '@/utils/locale';

const RemainingRangeCount = ({ rangeActor }) => {
  const { locale } = useRouter();
  const remainingCount = useSelector(rangeActor, (state) => {
    const { totalRangeCycle, currentRangeCycle } = (state as any).context;
    return totalRangeCycle - currentRangeCycle + 1; // +1 to include the current cycle
  });
  const localizedRemainingCount = toLocalizedNumber(remainingCount, locale);

  return <span>{localizedRemainingCount}</span>;
};

export default RemainingRangeCount;
