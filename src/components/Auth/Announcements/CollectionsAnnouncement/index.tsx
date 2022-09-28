import React from 'react';

import AnnouncementBody from '../AnnouncementBody';

import Slide1 from './Slides/Slide1';

import Carousel from '@/dls/Carousel';
import { logCarouselSlideCompletion } from '@/utils/eventLogger';

type Props = {
  onCompleted: () => void;
};

const CollectionsAnnouncement: React.FC<Props> = ({ onCompleted }) => {
  const onLastSlideCompleted = () => {
    logCarouselSlideCompletion('collections_announcement', 1);
    onCompleted();
  };

  return (
    <AnnouncementBody>
      <Carousel
        slides={[
          {
            id: 'collection-slide-1',
            component: <Slide1 onComplete={onLastSlideCompleted} />,
          },
        ]}
      />
    </AnnouncementBody>
  );
};

export default CollectionsAnnouncement;
