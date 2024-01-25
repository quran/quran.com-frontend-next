import { useOnboarding } from '../OnboardingProvider';

import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';

const useStartOnboarding = () => {
  const { startTour } = useOnboarding();

  useBrowserLayoutEffect(() => {
    startTour();
  }, [startTour]);
};

export default useStartOnboarding;
