/* eslint-disable max-lines */
import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from './index.module.scss';
import styles from './profile.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import DeleteAccountButton from '@/components/Profile/DeleteAccountButton';
import BookmarksAndCollectionsSection from '@/components/Verses/BookmarksAndCollectionsSection';
import RecentReadingSessions from '@/components/Verses/RecentReadingSessions';
import Button from '@/dls/Button/Button';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useAuthData from '@/hooks/auth/useAuthData';
import useLogout from '@/hooks/auth/useLogout';
import Error from '@/pages/_error';
import { DEFAULT_PHOTO_URL } from '@/utils/auth/constants';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getProfileNavigationUrl } from '@/utils/navigation';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chaptersData?: ChaptersData;
}

const nameSample = 'Mohammad Ali';
const emailSample = 'mohammadali@quran.com';
const ProfilePage: NextPage<Props> = () => {
  const { t, lang } = useTranslation();
  const { userData: user, isLoading, userDataError: error, isAuthenticated } = useAuthData();
  const runLogout = useLogout();

  const onLogoutClicked = async () =>
    runLogout({ eventName: 'profile_logout', redirectToLogin: true });

  if (error) {
    return <Error statusCode={500} />;
  }

  const email = user?.email || emailSample;
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const photoUrl = user?.photoUrl || DEFAULT_PHOTO_URL;

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

  const accountActions = (
    <div
      className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.actionsContainer)}
    >
      <div className={styles.action}>
        <Button isDisabled={isLoading} onClick={onLogoutClicked}>
          {t('common:logout')}
        </Button>
      </div>
      <div className={styles.action}>
        <DeleteAccountButton isDisabled={isLoading} />
      </div>
    </div>
  );

  const profileInfo = (
    <div className={classNames(layoutStyle.flowItem)}>
      <div className={styles.profileContainer}>
        <div className={styles.profilePicture}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.profilePicture} alt="avatar" src={photoUrl} />
        </div>
        {isLoading ? (
          profileSkeletonInfoSkeleton
        ) : (
          <div className={styles.profileInfoContainer}>
            <h2 className={styles.name}>{`${firstName} ${lastName}`.trim() || nameSample}</h2>
            <div className={styles.email}>{email}</div>
          </div>
        )}
      </div>
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
            {isAuthenticated && profileInfo}
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
            {isAuthenticated && accountActions}
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

export default ProfilePage;
