import MoonIllustrationSVG from '../../../../../../public/images/moon-illustration.svg';

import Slide from '@/dls/Carousel/Slide';

const Slide1 = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.slide-1.title"
      header={<MoonIllustrationSVG />}
    />
  );
};

export default Slide1;
