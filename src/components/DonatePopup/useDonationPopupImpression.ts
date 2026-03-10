import { useEffect, useRef } from 'react';

import { logEvent } from '@/utils/eventLogger';

type AnalyticsParams = {
  pathname: string;
  locale: string;
  isReaderRoute: boolean;
};

const useDonationPopupImpression = ({
  shouldShow,
  asPath,
  analyticsParams,
}: {
  shouldShow: boolean;
  asPath: string;
  analyticsParams: AnalyticsParams;
}) => {
  const impressionPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldShow) {
      impressionPathRef.current = null;
      return;
    }

    if (impressionPathRef.current === asPath) {
      return;
    }

    impressionPathRef.current = asPath;
    logEvent('ramadan_donation_popup_impression', analyticsParams);
  }, [analyticsParams, asPath, shouldShow]);
};

export default useDonationPopupImpression;
