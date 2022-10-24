import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';

const Slide2 = ({ action }) => {
  return (
    <Slide
      action={action}
      description={
        <Trans
          components={{ br: <br /> }}
          i18nKey="common:announcements.auth-onboarding.slide-2.description"
        />
      }
      titleKey="common:announcements.auth-onboarding.slide-2.title"
    />
  );
};

export default Slide2;
