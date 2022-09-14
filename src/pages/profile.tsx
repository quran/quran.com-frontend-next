import { useEffect } from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import layoutStyle from './index.module.scss';
import styles from './profile.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import DeleteAccountButton from '@/components/Profile/DeleteAccountButton';
import BookmarksAndCollectionsSection from '@/components/Verses/BookmarksAndCollectionsSection';
import RecentReadingSessions from '@/components/Verses/RecentReadingSessions';
import Button from '@/dls/Button/Button';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { removeLastSyncAt } from '@/redux/slices/Auth/userDataSync';
import { getUserProfile, logoutUser } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { DEFAULT_PHOTO_URL } from '@/utils/auth/constants';
import { isLoggedIn } from '@/utils/auth/login';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getProfileNavigationUrl } from '@/utils/navigation';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chaptersData?: ChaptersData;
}

const nameSample = 'Mohammad Ali';
const emailSample = 'mohammadali@quran.com';
const ProfilePage: NextPage<Props> = ({ chaptersData }) => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation();
  const router = useRouter();

  const {
    data: userData,
    isValidating,
    error,
  } = useSWR(isLoggedIn() ? makeUserProfileUrl() : null, getUserProfile);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
    }
  }, [router]);

  const onLogoutClicked = () => {
    if (!isLoggedIn()) {
      return;
    }
    logButtonClick('profile_logout');
    logoutUser().then(() => {
      dispatch({ type: removeLastSyncAt.type });
      router.push('/login');
      router.reload();
    });
  };

  const isLoading = isValidating || !userData;

  if (error) {
    return <Error statusCode={500} />;
  }

  const { email, firstName, lastName, photoUrl } = userData || {};

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
    <DataContext.Provider value={chaptersData}>
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
            <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth)}>
              <BookmarksAndCollectionsSection />
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
    </DataContext.Provider>
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
