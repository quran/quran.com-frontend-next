/* eslint-disable max-lines */
import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from './index.module.scss';
import styles from './profile.module.scss';

import withAuth from '@/components/Auth/withAuth';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import DeleteAccountButton from '@/components/Profile/DeleteAccountButton';
import BookmarksAndCollectionsSection from '@/components/Verses/BookmarksAndCollectionsSection';
import RecentReadingSessions from '@/components/Verses/RecentReadingSessions';
import Button from '@/dls/Button/Button';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useCurrentUser from '@/hooks/auth/useCurrentUser';
import { logoutUser } from '@/utils/auth/api';
import { DEFAULT_PHOTO_URL } from '@/utils/auth/constants';
import { isLoggedIn } from '@/utils/auth/login';
import { removeLastSyncAt } from '@/utils/auth/userDataSync';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getLoginNavigationUrl,
  getProfileNavigationUrl,
} from '@/utils/navigation';
import Error from 'src/pages/_error';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chaptersData?: ChaptersData;
}

const nameSample = 'Mohammad Ali';
const emailSample = 'mohammadali@quran.com';
const ProfilePage: NextPage<Props> = () => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const { user, isLoading, error } = useCurrentUser();

  const onLogoutClicked = async () => {
    if (!isLoggedIn()) {
      return;
    }
    logButtonClick('profile_logout');

    await logoutUser();
    removeLastSyncAt();
    router.push(getLoginNavigationUrl());
    router.reload();
  };

  if (error) {
    return <Error statusCode={500} />;
  }

  const { email, firstName, lastName, photoUrl } = user;

  const profileSkeletonInfoSkeleton = (
    <div className={classNames(styles.profileInfoContainer, styles.skeletonContainer)}>
      <Skeleton>
        <h2 className={styles.name}>{nameSample}</h2>
      </Skeleton>
      <Skeleton>
        <div className={styles.email}>{emailSample}</div>
      </Skeleton>
    </div>
  );

  const profileInfo = (
    <div className={styles.profileInfoContainer}>
      <h2 className={styles.name}>{`${firstName} ${lastName}`}</h2>
      <div className={styles.email}>{email}</div>
    </div>
  );

  return (
    <>
      <NextSeoWrapper
        title={t('common:profile')}
        url={getCanonicalUrl(lang, getProfileNavigationUrl())}
        languageAlternates={getLanguageAlternates(getProfileNavigationUrl())}
        nofollow
        noindex
      />
      <div className={layoutStyle.pageContainer}>
        <div className={layoutStyle.flow}>
          <div className={styles.container}>
            <div className={classNames(layoutStyle.flowItem)}>
              <div className={styles.profileContainer}>
                <div className={styles.profilePicture}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.profilePicture}
                    alt="avatar"
                    src={photoUrl || DEFAULT_PHOTO_URL}
                  />
                </div>
                {isLoading ? profileSkeletonInfoSkeleton : profileInfo}
              </div>
            </div>
            <div
              className={classNames(
                layoutStyle.flowItem,
                layoutStyle.fullWidth,
                styles.recentReadingContainer,
              )}
            >
              <RecentReadingSessions />
            </div>
            <div
              className={classNames(
                layoutStyle.flowItem,
                layoutStyle.fullWidth,
                styles.bookmarksAndCollectionsContainer,
              )}
            >
              <BookmarksAndCollectionsSection isHomepage={false} />
            </div>

            <div
              className={classNames(
                layoutStyle.flowItem,
                layoutStyle.fullWidth,
                styles.actionsContainer,
              )}
            >
              <div className={styles.action}>
                <DeleteAccountButton isDisabled={isLoading} />
              </div>
              <div className={styles.action}>
                <Button isDisabled={isLoading} onClick={onLogoutClicked}>
                  {t('common:logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default withAuth(ProfilePage);
