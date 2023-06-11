import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';
import Link, { LinkVariant } from '@/dls/Link/Link';

const QuranGrowthJourneySlide = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.quran-growth-journey.title"
      description={
        <Trans
          components={{
            link: <Link href="https://feedback.quran.com" variant={LinkVariant.Blend} />,
          }}
          i18nKey="common:announcements.auth-onboarding.quran-growth-journey.description"
        />
      }
    />
  );
};

export default QuranGrowthJourneySlide;
