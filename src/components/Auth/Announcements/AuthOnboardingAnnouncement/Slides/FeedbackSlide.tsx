import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';
import Link, { LinkVariant } from '@/dls/Link/Link';

const FeedbackSlide = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.feedback.title"
      description={
        <Trans
          components={{
            link: <Link href="https://feedback.quran.com" variant={LinkVariant.Blend} isNewTab />,
          }}
          i18nKey="common:announcements.auth-onboarding.feedback.description"
        />
      }
    />
  );
};

export default FeedbackSlide;
