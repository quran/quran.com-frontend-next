import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';

const QuranGrowthJourneySlide = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.quran-growth-journey.title"
      description={
        <Trans i18nKey="common:announcements.auth-onboarding.quran-growth-journey.description" />
      }
    />
  );
};

export default QuranGrowthJourneySlide;
