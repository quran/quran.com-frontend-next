import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from './index.module.scss';
import styles from './profile.module.scss';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import BookmarksSection from 'src/components/Verses/BookmarksSection';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import DataContext from 'src/contexts/DataContext';
import { getAllChaptersData } from 'src/utils/chapter';

const ProfilePage = ({ chaptersData }) => {
  const { t } = useTranslation();

  // TODO: get user data
  const name = 'John Doe';
  const email = 'muhajirframe@gmail.com';

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
                <Button>{t('common:logout')}</Button>
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
