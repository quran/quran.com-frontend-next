import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import useAuthData from '@/hooks/auth/useAuthData';
import {
  selectAfterOnboardingRedirect,
  setAfterOnboardingRedirect,
} from '@/redux/slices/onboarding';
import { completeAnnouncement } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isCompleteProfile } from '@/utils/auth/complete-signup';
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
  const { userData } = useAuthData();
  const router = useRouter();
  const dispatch = useDispatch();
  const afterOnboardingRedirect = useSelector(selectAfterOnboardingRedirect);

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

    if (
      announcementType === AnnouncementType.AuthOnboarding &&
      afterOnboardingRedirect &&
      userData &&
      isCompleteProfile(userData)
    ) {
      const url = new URL(afterOnboardingRedirect, window.location.origin);
      url.searchParams.set('source', 'signup');
      const redirectUrl = `${url.pathname}${url.search}${url.hash}`;
      dispatch(setAfterOnboardingRedirect(null));
      router.push(redirectUrl);
    }
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
