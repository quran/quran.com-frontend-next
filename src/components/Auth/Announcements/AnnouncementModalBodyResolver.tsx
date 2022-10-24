import dynamic from 'next/dynamic';
import { useSWRConfig } from 'swr';

import { completeAnnouncement } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import Announcement, { AnnouncementType } from 'types/auth/Announcement';
import UserProfile from 'types/auth/UserProfile';

const WelcomeMessageModalBody = dynamic(
  () => import('@/components/Auth/Announcements/AuthOnboardingAnnouncement'),
);

const CollectionsAnnouncement = dynamic(
  () => import('@/components/Auth/Announcements/CollectionsAnnouncement'),
);

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
  if (announcement.type === AnnouncementType.CollectionsAnnouncement) {
    return (
      <CollectionsAnnouncement
        onCompleted={() => onCompleted(AnnouncementType.CollectionsAnnouncement)}
      />
    );
  }

  throw new Error("AnnouncementModalBodyResolver doesn't support this announcement type");
};

export default AnnouncementModalBodyResolver;
