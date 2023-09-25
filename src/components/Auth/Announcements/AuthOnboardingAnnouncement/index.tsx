import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import AnnouncementBody from '../AnnouncementBody';

import DataSyncSlide from './Slides/DataSyncSlide';
import FeedbackSlide from './Slides/FeedbackSlide';
import QuranFoundationLinkSlide from './Slides/QuranFoundationLinkSlide';
import QuranGrowthJourneySlide from './Slides/QuranGrowthJourneySlide';
import WelcomeSlide from './Slides/WelcomeSlide';

import Button from '@/dls/Button/Button';
import Carousel from '@/dls/Carousel';
import { logCarouselSlideCompletion } from '@/utils/eventLogger';

enum SlideId {
  Welcome = 'welcome',
  DataSync = 'data-sync',
  QuranGrowthJourney = 'quran-growth-journey',
  QuranFoundationLink = 'quran-foundation-link',
  Feedback = 'feedback',
}

const slideIdToAnalyticsName: Record<SlideId, string> = {
  [SlideId.Welcome]: 'welcome',
  [SlideId.DataSync]: 'data_sync',
  [SlideId.QuranGrowthJourney]: 'quran_growth_journey',
  [SlideId.QuranFoundationLink]: 'quran_foundation_link',
  [SlideId.Feedback]: 'feedback',
};

const logSlideCompletedClick = (slideId: SlideId) => {
  logCarouselSlideCompletion('onboarding_announcement', slideIdToAnalyticsName[slideId]);
};

const slides = [
  {
    id: SlideId.Welcome,
    component: WelcomeSlide,
  },
  {
    id: SlideId.DataSync,
    component: DataSyncSlide,
  },
  {
    id: SlideId.QuranGrowthJourney,
    component: QuranGrowthJourneySlide,
  },
  {
    id: SlideId.QuranFoundationLink,
    component: QuranFoundationLinkSlide,
  },
  {
    id: SlideId.Feedback,
    component: FeedbackSlide,
  },
];

const makeSlides = (t: Translate, onCompleted: () => void) => {
  return slides.map((slide, index) => ({
    ...slide,
    component: (
      <slide.component
        action={
          <Button
            href={`#${index === slides.length - 1 ? slide.id : slides[index + 1].id}`}
            onClick={() => {
              logSlideCompletedClick(slide.id);
              if (index === slides.length - 1) {
                onCompleted();
              }
            }}
          >
            {t(`announcements.auth-onboarding.${slide.id}.action`)}
          </Button>
        }
      />
    ),
  }));
};

type AuthOnboardingAnnouncementProps = {
  onCompleted: () => void;
};

const AuthOnboardingAnnouncement = ({ onCompleted }: AuthOnboardingAnnouncementProps) => {
  const { t } = useTranslation('common');

  return (
    <AnnouncementBody>
      <Carousel slides={makeSlides(t, onCompleted)} />
    </AnnouncementBody>
  );
};

export default AuthOnboardingAnnouncement;
