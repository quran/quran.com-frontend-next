import Trans from 'next-translate/Trans';

import Slide from '@/dls/Carousel/Slide';

const DataSyncSlide = ({ action }) => {
  return (
    <Slide
      action={action}
      description={
        <Trans
          components={{ br: <br /> }}
          i18nKey="common:announcements.auth-onboarding.data-sync.description"
        />
      }
      titleKey="common:announcements.auth-onboarding.data-sync.title"
    />
  );
};

export default DataSyncSlide;
