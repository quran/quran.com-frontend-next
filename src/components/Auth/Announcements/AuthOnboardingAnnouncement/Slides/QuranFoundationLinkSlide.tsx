import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';

const QuranFoundationLinkSlide = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.quran-foundation-link.title"
      description={
        <Trans i18nKey="common:announcements.auth-onboarding.quran-foundation-link.description" />
      }
    />
  );
};

export default QuranFoundationLinkSlide;
