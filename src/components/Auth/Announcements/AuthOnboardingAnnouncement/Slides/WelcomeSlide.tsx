import Slide from '@/dls/Carousel/Slide';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';

const WelcomeSlide = ({ action }) => {
  return (
    <Slide
      action={action}
      titleKey="common:announcements.auth-onboarding.welcome.title"
      header={<MoonIllustrationSVG />}
    />
  );
};

export default WelcomeSlide;
