import { useEffect } from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import layoutStyle from './index.module.scss';
import styles from './profile.module.scss';

import Button from 'src/components/dls/Button/Button';
import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import DeleteAccountButton from 'src/components/Profile/DeleteAccountButton';
import BookmarksSection from 'src/components/Verses/BookmarksSection';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import { getUserProfile, logoutUser } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import { DEFAULT_PHOTO_URL } from 'src/utils/auth/constants';
import { isLoggedIn } from 'src/utils/auth/login';
import { getAllChaptersData } from 'src/utils/chapter';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chaptersData?: ChaptersData;
}

const nameSample = 'Mohammad Ali';
const emailSample = 'mohammadali@quran.com';
const ProfilePage: NextPage<Props> = ({ chaptersData }) => {
  const { t } = useTranslation();
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
    logoutUser().then(() => {
      router.push('/login');
      router.reload();
    });
  };

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
                {isValidating ? profileSkeletonInfoSkeleton : profileInfo}
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
              <BookmarksSection />
            </div>

            <div
              className={classNames(
                layoutStyle.flowItem,
                layoutStyle.fullWidth,
                styles.actionsContainer,
              )}
            >
              <div className={styles.action}>
                <DeleteAccountButton isDisabled={isValidating} />
              </div>
              <div className={styles.action}>
                <Button isDisabled={isValidating} onClick={onLogoutClicked}>
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
