/* eslint-disable react-func/max-lines-per-function */
import classNames from 'classnames';
import Cookies from 'js-cookie';
import { GetServerSideProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import layoutStyle from './index.module.scss';
import styles from './profile.module.scss';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import BookmarksSection from 'src/components/Verses/BookmarksSection';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import { REFRESH_TOKEN_COOKIE_NAME, USER_NAME_COOKIE_NAME } from 'src/utils/auth/constants';
import { getAllChaptersData } from 'src/utils/chapter';
import { getBasePath } from 'src/utils/url';
import ChaptersData from 'types/ChaptersData';

interface Props {
  hasError?: boolean;
  user?: {
    email: string;
  };
  chaptersData?: ChaptersData;
}

const ProfilePage: NextPage<Props> = ({ chaptersData, hasError, user }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const onLogoutClicked = () => {
    fetch('/api/auth/logout').then(() => {
      router.push('/');
    });
  };

  if (hasError) {
    return <Error statusCode={500} />;
  }
  const name = Cookies.get(USER_NAME_COOKIE_NAME);
  const { email } = user;

  return (
    <DataContext.Provider value={chaptersData}>
      <div className={layoutStyle.pageContainer}>
        <div className={layoutStyle.flow}>
          <div className={styles.container}>
            <div className={classNames(layoutStyle.flowItem)}>
              <div className={styles.profileContainer}>
                <div className={styles.profilePicture} />
                <div className={styles.profileInfoContainer}>
                  <h2 className={styles.name}>{name}</h2>
                  <div className={styles.email}>{email}</div>
                </div>
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
                <Button type={ButtonType.Error} variant={ButtonVariant.Ghost}>
                  {t('profile:delete-account')}
                </Button>
              </div>
              <div className={styles.action}>
                <Button onClick={onLogoutClicked}>{t('common:logout')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.req.cookies[REFRESH_TOKEN_COOKIE_NAME]) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
      props: {},
    };
  }
  try {
    // eslint-disable-next-line i18next/no-literal-string
    const response = await fetch(`${getBasePath()}/api/users/profile`, {
      credentials: 'include',
      headers: {
        Cookie: context.req.headers.cookie,
      },
    });
    if (response.status !== 200) {
      return {
        props: {
          hasError: true,
        },
      };
    }
    const jsonResponse = await response.json();
    // if we just refreshed the token
    if (jsonResponse.cookies) {
      context.res.setHeader('set-cookie', jsonResponse.cookies);
    }
    return {
      props: {
        user: jsonResponse.user,
        chaptersData: await getAllChaptersData(context.locale),
      },
    };
  } catch (error) {
    return {
      props: {
        hasError: true,
      },
    };
  }
};

export default ProfilePage;
