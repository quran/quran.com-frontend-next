import useTranslation from 'next-translate/useTranslation';

import AnnouncementBody from '../AnnouncementBody';

import Slide1 from './Slides/Slide1';
import Slide2 from './Slides/Slide2';
import Slide3 from './Slides/Slide3';

import Button from '@/dls/Button/Button';
import Carousel from '@/dls/Carousel';
import { logCarouselSlideCompletion } from '@/utils/eventLogger';

type AuthOnboardingAnnouncementProps = {
  onCompleted: () => void;
};
const AuthOnboardingAnnouncement = ({ onCompleted }: AuthOnboardingAnnouncementProps) => {
  const { t } = useTranslation('common');

  const logSlideCompletedClick = (slideNumber: number) => {
    logCarouselSlideCompletion('onboarding_announcement', slideNumber);
  };

  const onLastSlideCompleted = () => {
    logSlideCompletedClick(3);
    onCompleted();
  };

  return (
    <AnnouncementBody>
      <Carousel
        slides={[
          {
            id: 'announcement-slide-1',
            component: (
              <Slide1
                action={
                  <Button href="#announcement-slide-2" onClick={() => logSlideCompletedClick(1)}>
                    {t('announcements.auth-onboarding.slide-1.action')}
                  </Button>
                }
              />
            ),
          },
          {
            id: 'announcement-slide-2',
            component: (
              <Slide2
                action={
                  <Button href="#announcement-slide-3" onClick={() => logSlideCompletedClick(2)}>
                    {t('announcements.auth-onboarding.slide-2.action')}
                  </Button>
                }
              />
            ),
          },
          {
            id: 'announcement-slide-3',
            component: (
              <Slide3
                action={
                  <Button href="#announcement-slide-3" onClick={onLastSlideCompleted}>
                    {t('announcements.auth-onboarding.slide-3.action')}
                  </Button>
                }
              />
            ),
          },
        ]}
      />
    </AnnouncementBody>
  );
};

export default AuthOnboardingAnnouncement;
