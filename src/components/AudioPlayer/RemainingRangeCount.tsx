import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import { toLocalizedNumber } from '@/utils/locale';

const RemainingRangeCount = ({ rangeActor }) => {
  const { lang } = useTranslation('common');
  const remainingCount = useSelector(rangeActor, (state) => {
    const { totalRangeCycle, currentRangeCycle } = (state as any).context;
    return totalRangeCycle - currentRangeCycle + 1; // +1 to include the current cycle
  });
  const localizedRemainingCount = toLocalizedNumber(remainingCount, lang);

  return <span>{localizedRemainingCount}</span>;
};

export default RemainingRangeCount;
