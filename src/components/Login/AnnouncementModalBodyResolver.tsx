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
  const { mutate, cache } = useSWRConfig();

  const onCompleted = async (announcementType: AnnouncementType) => {
    const hasil = await completeAnnouncement({ announcementType });
    alert(hasil);
    const userProfileData = cache.get(makeUserProfileUrl());
    const newUserProfileData: UserProfile = {
      ...userProfileData,
      announcement: null, // clean up the announcement for this session
    };
    mutate(makeUserProfileUrl(), newUserProfileData);
  };

  if (announcement.type === AnnouncementType.AuthOnboarding) {
    return (
      <WelcomeMessageModalBody onCompleted={() => onCompleted(AnnouncementType.AuthOnboarding)} />
    );
  }

  throw new Error("AnnouncementModalBodyResolver doesn't support this announcement type");
};

export default AnnouncementModalBodyResolver;
