import dynamic from 'next/dynamic';
import { useSWRConfig } from 'swr';

import { completeAnnouncement } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import Announcement, { AnnouncementType } from 'types/auth/Announcement';
import UserProfile from 'types/auth/UserProfile';

const WelcomeMessageModalBody = dynamic(() => import('./WelcomeMessageModalBody'));

type AnnouncementModalBodyResolverProps = {
  announcement: Announcement;
};

const AnnouncementModalBodyResolver = ({ announcement }: AnnouncementModalBodyResolverProps) => {
  const { mutate } = useSWRConfig();

  const onCompleted = async (announcementType: AnnouncementType) => {
    mutate(
      makeUserProfileUrl(),
      (currentProfileData: UserProfile) => {
        return { ...currentProfileData, announcement: null };
      },
      {
        revalidate: false,
      },
    );
    await completeAnnouncement({ announcementType });
  };

  if (announcement.type === AnnouncementType.AuthOnboarding) {
    return (
      <WelcomeMessageModalBody onCompleted={() => onCompleted(AnnouncementType.AuthOnboarding)} />
    );
  }

  throw new Error("AnnouncementModalBodyResolver doesn't support this announcement type");
};

export default AnnouncementModalBodyResolver;
