import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';
import Link, { LinkVariant } from '@/dls/Link/Link';

const Slide4 = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.slide-4.title"
      description={
        <Trans
          components={{
            link: <Link href="https://feedback.quran.com" variant={LinkVariant.Blend} />,
          }}
          i18nKey="common:announcements.auth-onboarding.slide-4.description"
        />
      }
    />
  );
};

export default Slide4;
